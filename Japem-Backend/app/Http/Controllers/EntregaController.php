<?php

namespace App\Http\Controllers;

use App\Models\Asignacion;
use App\Models\Iap;
use App\Models\Inventario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntregaController extends Controller
{
    /**
     * Procesa la entrega física:
     * 1. Descuenta del STOCK ACTUAL.
     * 2. Actualiza estatus de la asignación a 'entregado'.
     * 3. Guarda responsable y lugar en la misma tabla asignaciones.
     */
    public function procesarEntrega(Request $request)
    {
        $request->validate([
            'asignacion_id' => 'required|exists:asignaciones,id',
            'responsable_entrega' => 'required|string',
            'lugar_entrega' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // 1. OBTENER LA ASIGNACIÓN
            $asignacion = Asignacion::findOrFail($request->asignacion_id);

            // Verificamos si ya fue entregada para no descontar doble
            if (in_array($asignacion->estatus, ['procesado', 'entregado'])) {
                return response()->json(['message' => 'Esta asignación ya fue entregada anteriormente.'], 400);
            }

            // 2. OBTENER DETALLES
            $detalles = DB::table('detalle_asignaciones')
                ->where('asignacion_id', $asignacion->id)
                ->get();

            if ($detalles->isEmpty()) {
                throw new \Exception("La asignación no tiene detalles de productos.");
            }

            // 3. DESCONTAR STOCK
            foreach ($detalles as $detalle) {
                $producto = Inventario::find($detalle->inventario_id);

                if (!$producto) {
                    throw new \Exception("Producto ID {$detalle->inventario_id} no encontrado.");
                }

                // Validación de Stock Real
                if ($producto->cantidad_actual < $detalle->cantidad) {
                    throw new \Exception("Stock insuficiente para {$producto->nombre_producto}. Quedan: {$producto->cantidad_actual}");
                }

                // Decremento del stock físico
                $producto->decrement('cantidad_actual', $detalle->cantidad);

                // Actualizamos el detalle también
                DB::table('detalle_asignaciones')
                    ->where('id', $detalle->id)
                    ->update(['estatus' => 'entregado', 'updated_at' => now()]);
            }

            // 4. ACTUALIZAR LA ASIGNACIÓN (CONFIRMAR ENTREGA)
            $asignacion->update([
                'estatus' => 'entregado',
                'responsable_entrega' => $request->responsable_entrega,
                'lugar_entrega' => $request->lugar_entrega,
                'fecha_entrega_real' => now(),
                'updated_at' => now()
            ]);

            // 5. INCREMENTAR CONTADOR DE LA IAP
            DB::table('iaps')->where('id', $asignacion->iap_id)->increment('veces_donado');

            DB::commit();

            return response()->json([
                'message' => 'Entrega confirmada exitosamente. Inventario actualizado.',
                'folio' => $asignacion->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Manejo de error específico de base de datos (Check Constraint)
            if (str_contains($e->getMessage(), 'asignaciones_estatus_check')) {
                return response()->json(['message' => 'Error de BD: El estatus "entregado" no está permitido. Revisa las restricciones de la tabla.'], 500);
            }
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * HISTORIAL (PRINCIPAL)
     * Trae TODO (Pendientes + Entregados) para que la tabla del frontend se actualice en tiempo real.
     */
    public function historial()
    {
        $historial = Asignacion::join('iaps', 'asignaciones.iap_id', '=', 'iaps.id')
            ->join('detalle_asignaciones', 'asignaciones.id', '=', 'detalle_asignaciones.asignacion_id')
            ->join('inventarios', 'detalle_asignaciones.inventario_id', '=', 'inventarios.id')
            ->select(
                'asignaciones.id',
                'asignaciones.estatus',
                DB::raw('COALESCE(asignaciones.fecha_asignacion, asignaciones.created_at) as fecha'),
                'asignaciones.fecha_entrega_real',
                'asignaciones.responsable_entrega',
                'asignaciones.lugar_entrega',
                'iaps.nombre_iap',
                'inventarios.nombre_producto as producto_nombre',
                'detalle_asignaciones.cantidad'
            )
            ->orderByDesc('asignaciones.id')
            ->get();

        return response()->json($historial);
    }

    /**
     * PENDIENTES (Opcional, por si se requiere filtrado)
     */
    public function pendientes()
    {
        $pendientes = Asignacion::join('iaps', 'asignaciones.iap_id', '=', 'iaps.id')
            ->join('detalle_asignaciones', 'asignaciones.id', '=', 'detalle_asignaciones.asignacion_id')
            ->join('inventarios', 'detalle_asignaciones.inventario_id', '=', 'inventarios.id')
            ->select(
                'asignaciones.id',
                'iaps.nombre_iap',
                'inventarios.nombre_producto as producto_nombre',
                'detalle_asignaciones.cantidad',
                DB::raw('COALESCE(asignaciones.fecha_asignacion, asignaciones.created_at) as fecha'),
                'asignaciones.estatus',
                'asignaciones.responsable_entrega',
                'asignaciones.lugar_entrega'
            )
            ->where('asignaciones.estatus', 'pendiente')
            ->orderBy('asignaciones.id', 'desc')
            ->get();

        return response()->json($pendientes);
    }

    /**
     * ALGORITMO DE SUGERENCIAS (NUEVO - BASADO EN MATRIZ DE CLASIFICACIÓN)
     */
    public function sugerirAsignacion($inventarioId)
    {
        $producto = Inventario::find($inventarioId);
        if (!$producto) return response()->json([]);

        $prodNombre = strtoupper(trim($producto->nombre_producto));
        $prodCat    = strtoupper(trim($producto->categoria_producto));

        // 1. DEFINICIÓN DE LA MATRIZ DE REGLAS (Basada en tu imagen)
        // [Palabra Clave] => [Clasificaciones Permitidas]
        $matrizReglas = [
            'ALIMENT' => ['A1', 'A2', 'B2'],
            'LIMPIEZA' => ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'C4'],
            'ASEO' => ['A1', 'A2'],
            'HIGIENE' => ['A1', 'A2'],
            'PAÑAL' => [], // Se define dinámicamente abajo
            'PAPELERIA' => ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'C4'],
            'OFICINA' => ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'C4'],
            'COCINA' => ['A1', 'A2'],
            'COLCHON' => ['A1', 'A2'],
            'BLANCOS' => ['A1', 'A2'],
            'ENTRETENIMIENTO' => ['A1', 'A2', 'B2'],
            'JUGUETE' => ['A2', 'A3', 'B2'],
            'ESCOLAR' => ['A2', 'A3', 'B2'],
            'DIDACTICO' => ['A2', 'A3'],
            'ROPA' => [], // Se define dinámicamente abajo
            'MEDICAMENTO' => ['C1', 'A1', 'A2'],
            'CURACION' => ['A1', 'A2', 'B1'],
            'SILLA' => ['B1'], // Sillas de ruedas
            'REHABILITA' => ['B1'],
            'PROTECCION CIVIL' => ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3'],
            'MOBILIARIO' => ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3'],
            'ANIMAL' => ['D', 'C4'],
        ];

        // --- LÓGICA DINÁMICA PARA PAÑALES ---
        if (str_contains($prodNombre, 'PAÑAL') || str_contains($prodCat, 'PAÑAL')) {
            if (str_contains($prodNombre, 'ADULTO') || str_contains($prodNombre, 'GRANDE')) {
                $matrizReglas['PAÑAL'] = ['A1']; // Solo Asilos
            } else {
                $matrizReglas['PAÑAL'] = ['A2']; // Niños (Default)
            }
        }

        // --- LÓGICA DINÁMICA PARA ROPA ---
        if (str_contains($prodNombre, 'ROPA') || str_contains($prodCat, 'ROPA') || str_contains($prodCat, 'VESTIDO')) {
            if (str_contains($prodNombre, 'NIÑ') || str_contains($prodNombre, 'BEBE') || str_contains($prodNombre, 'INFANTIL')) {
                $matrizReglas['ROPA'] = ['A2']; // Niños
            } else {
                $matrizReglas['ROPA'] = ['C1', 'C2', 'C3']; // Adultos / Vulnerables
            }
        }

        // 2. OBTENER CANDIDATOS (Solo IAPs Activas)
        $candidatos = Iap::where('estatus', 'Activa')->get();

        $sugerencias = $candidatos->map(function ($iap) use ($prodNombre, $prodCat, $matrizReglas) {
            $puntaje = 0;
            $razones = [];
            $esCandidato = false;

            $clase = strtoupper($iap->clasificacion);
            $necComp = strtoupper($iap->necesidad_complementaria ?? '');

            // --- FILTRO 1: ¿CUMPLE LA TABLA? (Criterio Principal) ---
            foreach ($matrizReglas as $keyword => $clasesPermitidas) {
                // Buscamos coincidencia en Nombre o Categoría del producto
                if (str_contains($prodNombre, $keyword) || str_contains($prodCat, $keyword)) {
                    // Verificamos si la clase de la IAP está permitida
                    if (in_array($clase, $clasesPermitidas)) {
                        $esCandidato = true;
                        $razones[] = "✅ Autorizado por Clasificación";
                        break; // Ya cumple, salimos del ciclo
                    }
                }
            }

            // --- FILTRO 2: NECESIDAD COMPLEMENTARIA (Excepción) ---
            // Solo revisamos esto si NO pasó el filtro de la tabla
            if (!$esCandidato && !empty($necComp)) {
                $items = explode(',', $necComp);
                foreach ($items as $item) {
                    $itemLimpio = trim($item);
                    if (empty($itemLimpio)) continue;
                    // Búsqueda de coincidencia
                    if (str_contains($prodNombre, $itemLimpio) || str_contains($prodCat, $itemLimpio)) {
                        $esCandidato = true;
                        $razones[] = "⚠️ Excepción: Necesidad Complementaria ($itemLimpio)";
                        break;
                    }
                }
            }

            // SI NO ES CANDIDATO, LO DESCARTAMOS (RETORNA NULL)
            if (!$esCandidato) return null;


            // --- SISTEMA DE PUNTOS (SOLO PARA ORDENAR/DESEMPATAR) ---

            // 1. Méritos Administrativos
            if ($iap->es_certificada) {
                $puntaje += 20;
                $razones[] = "🎖️ Certificada";
            }
            if ($iap->tiene_donataria_autorizada) {
                $puntaje += 30;
                $razones[] = "📄 Donataria Autorizada";
            }
            if ($iap->tiene_padron_beneficiarios) {
                $puntaje += 20;
                $razones[] = "👥 Padrón Vigente";
            }

            // 2. Equidad (Quien menos tiene, va primero)
            if ($iap->veces_donado == 0) {
                $puntaje += 50;
            } else {
                // Penalización ligera para rotar: -5 puntos por cada donación previa
                $penalizacion = ($iap->veces_donado * 5);
                $puntaje -= $penalizacion;
            }

            return [
                'id' => $iap->id,
                'nombre_iap' => $iap->nombre_iap,
                'clasificacion' => $iap->clasificacion,
                'puntaje' => $puntaje,
                'razones' => $razones
            ];
        })->filter()->values(); // Filtramos nulos y reindexamos

        // Ordenamos por puntaje (El mejor calificado administrativamente va primero)
        return response()->json($sugerencias->sortByDesc('puntaje')->values());
    }
}
