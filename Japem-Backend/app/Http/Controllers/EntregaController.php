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
            // Revisamos tanto 'procesado' como 'entregado' por compatibilidad
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
                'estatus' => 'entregado', // Usamos 'entregado' para que coincida con la lógica visual
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
            // Si el error es por el Constraint Check de la BD, avisa claramente
            if (str_contains($e->getMessage(), 'asignaciones_estatus_check')) {
                return response()->json(['message' => 'Error de Base de Datos: El estatus "entregado" no está permitido. Ejecuta el SQL de corrección en PgAdmin.'], 500);
            }
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * HISTORIAL (PRINCIPAL)
     * Trae TODO (Pendientes + Entregados) para que la tabla se actualice en tiempo real
     * sin desaparecer los registros al cambiar de estatus.
     */
    public function historial()
    {
        $historial = Asignacion::join('iaps', 'asignaciones.iap_id', '=', 'iaps.id')
            ->join('detalle_asignaciones', 'asignaciones.id', '=', 'detalle_asignaciones.asignacion_id')
            ->join('inventarios', 'detalle_asignaciones.inventario_id', '=', 'inventarios.id')
            ->select(
                'asignaciones.id',
                'asignaciones.estatus',
                // Fecha de asignación (cuando se apartó)
                DB::raw('COALESCE(asignaciones.fecha_asignacion, asignaciones.created_at) as fecha'),

                // Datos de Entrega Real
                'asignaciones.fecha_entrega_real',
                'asignaciones.responsable_entrega',
                'asignaciones.lugar_entrega',

                'iaps.nombre_iap',
                'inventarios.nombre_producto as producto_nombre',
                'detalle_asignaciones.cantidad'
            )
            // IMPORTANTE: NO HAY WHERE. Traemos todo para que el frontend decida cómo pintar el botón.
            ->orderByDesc('asignaciones.id')
            ->get();

        return response()->json($historial);
    }

    /**
     * PENDIENTES
     * (Opcional, por si lo usas en algún dashboard específico)
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
     * ALGORITMO DE SUGERENCIAS
     */
    public function sugerirAsignacion($inventarioId)
    {
        $producto = Inventario::find($inventarioId);
        if (!$producto) return response()->json([]);

        $prodNombre = strtoupper(trim($producto->nombre_producto));
        $prodCat    = strtoupper(trim($producto->categoria_producto));

        $candidatos = Iap::where('estatus', 'Activa')
            ->where('es_certificada', true)
            ->where('tiene_donataria_autorizada', true)
            ->where('tiene_padron_beneficiarios', true)
            ->get();

        $sugerencias = $candidatos->map(function ($iap) use ($prodNombre, $prodCat) {
            $puntaje = 0;
            $razones = [];

            $necPrim = strtoupper($iap->necesidad_primaria ?? '');
            $necComp = strtoupper($iap->necesidad_complementaria ?? '');
            $rubro   = strtoupper($iap->rubro ?? '');
            $actividad = strtoupper($iap->actividad_asistencial ?? '');
            $clase = strtoupper($iap->clasificacion);

            $verificarMatchEnLista = function ($listaString, $busqueda) {
                if (empty($listaString)) return false;
                $items = explode(',', $listaString);
                foreach ($items as $item) {
                    $itemLimpio = trim($item);
                    if (empty($itemLimpio)) continue;
                    if (str_contains($busqueda, $itemLimpio) || str_contains($itemLimpio, $busqueda)) return true;
                }
                return false;
            };

            $tipoMatch = 'NINGUNO';

            if ($verificarMatchEnLista($necPrim, $prodNombre)) $tipoMatch = 'PRIMARIA';
            elseif ($verificarMatchEnLista($necComp, $prodNombre)) $tipoMatch = 'COMPLEMENTARIA';
            else {
                if ($verificarMatchEnLista($necPrim, $prodCat) || $verificarMatchEnLista($necComp, $prodCat)) $tipoMatch = 'CATEGORIA';
                else {
                    $esAfin = false;
                    if ($prodCat === 'ALIMENTOS' && (str_contains($rubro, 'ALIMENT') || str_contains($rubro, 'NUTRICI') || str_contains($actividad, 'COMEDOR'))) $esAfin = true;
                    if ($prodCat === 'MEDICAMENTOS' && (str_contains($rubro, 'SALUD') || str_contains($rubro, 'MÉDIC') || str_contains($rubro, 'HOSPITAL') || str_contains($rubro, 'REHABILITA'))) $esAfin = true;
                    if ($prodCat === 'ROPA' && (str_contains($rubro, 'VESTIDO') || str_contains($rubro, 'VIVIENDA') || str_contains($rubro, 'ASILO'))) $esAfin = true;
                    if ($prodCat === 'ALIMENTOS' && in_array($clase, ['A1', 'A2', 'A3', 'A4'])) $esAfin = true;
                    if ($esAfin) $tipoMatch = 'CATEGORIA';
                }
            }

            if ($tipoMatch === 'NINGUNO') return null;

            if (in_array($clase, ['A1', 'A2', 'A3', 'A4'])) {
                $puntaje += 400000;
                $razones[] = "Nivel 1: Beneficiarios Fijos (A)";
            } elseif (in_array($clase, ['B1', 'B2', 'B3'])) {
                $puntaje += 300000;
                $razones[] = "Nivel 2: Beneficiarios Temporales (B)";
            } elseif (in_array($clase, ['C1', 'C2', 'C3', 'C4'])) {
                $puntaje += 200000;
                $razones[] = "Nivel 3: Beneficiarios Flotantes (C)";
            } elseif ($clase === 'D') {
                $puntaje += 100000;
                $razones[] = "Nivel 4: Seres Sintientes (D)";
            }

            if ($tipoMatch === 'PRIMARIA') {
                $puntaje += 50000;
                $razones[] = "🎯 MATCH: Necesidad Primaria";
            } elseif ($tipoMatch === 'COMPLEMENTARIA') {
                $puntaje += 30000;
                $razones[] = "☑️ MATCH: Necesidad Complementaria";
            } elseif ($tipoMatch === 'CATEGORIA') {
                $puntaje += 10000;
                $razones[] = "📂 MATCH: Afinidad por Categoría";
            }

            if ($iap->veces_donado == 0) {
                $puntaje += 5000;
                $razones[] = "🌟 Nuevo (0 donativos)";
            } else {
                $puntaje -= ($iap->veces_donado * 10);
            }

            return [
                'id' => $iap->id,
                'nombre_iap' => $iap->nombre_iap,
                'clasificacion' => $iap->clasificacion,
                'necesidad_primaria' => $iap->necesidad_primaria,
                'necesidad_complementaria' => $iap->necesidad_complementaria,
                'veces_donado' => $iap->veces_donado,
                'puntaje' => $puntaje,
                'razones' => $razones
            ];
        })->filter();

        return response()->json($sugerencias->sortByDesc('puntaje')->values());
    }
}
