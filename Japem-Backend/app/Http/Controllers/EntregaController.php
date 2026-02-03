<?php

namespace App\Http\Controllers;

use App\Models\Entrega;
use App\Models\Iap;
use App\Models\Inventario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntregaController extends Controller
{
    /**
     * Procesa la entrega física, descuenta del STOCK ACTUAL y actualiza estatus.
     */
    public function procesarEntrega(Request $request)
    {
        $request->validate([
            'asignacion_id' => 'required',
            'responsable_entrega' => 'required|string',
            'lugar_entrega' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // 1. Obtener el detalle de la asignación (lo que se planeó entregar)
            $detalle = DB::table('detalle_asignaciones')
                ->where('id', $request->asignacion_id)
                ->first();

            if (!$detalle) {
                return response()->json(['message' => 'Error: No se encontró el detalle.'], 404);
            }

            // 2. BUSCAR EN INVENTARIO
            $itemInventario = Inventario::find($detalle->inventario_id);

            if (!$itemInventario) {
                return response()->json(['message' => 'Error: El producto no existe en el inventario.'], 404);
            }

            // --- CAMBIO CLAVE: VALIDACIÓN CONTRA STOCK ACTUAL ---
            // Verificamos si queda stock real disponible
            if ($itemInventario->cantidad_actual < $detalle->cantidad) {
                return response()->json([
                    'message' => "Stock insuficiente. Físicamente quedan: {$itemInventario->cantidad_actual}, intentas entregar: {$detalle->cantidad}"
                ], 400);
            }

            // --- CAMBIO CLAVE: DECREMENTO DEL STOCK ACTUAL ---
            // Restamos solo de la columna 'cantidad_actual'.
            // La columna 'cantidad' original NO SE TOCA (queda como histórico).
            $itemInventario->decrement('cantidad_actual', $detalle->cantidad);
            // --------------------------------------------------

            // 3. Preparar datos de la IAP
            $asignacionPadre = DB::table('asignaciones')
                ->where('id', $detalle->asignacion_id)
                ->first();

            if (!$asignacionPadre) {
                throw new \Exception("Error de Integridad: Detalle sin padre.");
            }

            $iapId = $asignacionPadre->iap_id;

            // 4. Crear registro de Entrega (Cabecera)
            $nuevaEntrega = Entrega::create([
                'iap_id' => $iapId,
                'fecha_entrega' => now(),
                'responsable_entrega' => $request->responsable_entrega,
                'lugar_entrega' => $request->lugar_entrega,
                'observaciones_generales' => 'Entrega confirmada. Ref Detalle #' . $detalle->id
            ]);

            // 5. Registrar detalle histórico de la salida
            DB::table('detalle_entregas')->insert([
                'entrega_id' => $nuevaEntrega->id,
                'inventario_id' => $detalle->inventario_id,
                'nombre_producto' => $itemInventario->nombre_producto,
                'cantidad_entregada' => $detalle->cantidad,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // 6. Actualizar la asignación a "procesado"
            DB::table('detalle_asignaciones')
                ->where('id', $request->asignacion_id)
                ->update([
                    'estatus' => 'procesado',
                    'fecha_entrega' => now(),
                    'updated_at' => now()
                ]);

            // 7. Incrementar contador de la IAP
            if ($iapId) {
                DB::table('iaps')
                    ->where('id', $iapId)
                    ->increment('veces_donado');
            }

            DB::commit();

            return response()->json([
                'message' => 'Entrega registrada exitosamente. Stock actualizado.',
                'folio' => $nuevaEntrega->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function pendientes()
    {
        $asignaciones = DB::table('detalle_asignaciones')
            ->join('asignaciones', 'detalle_asignaciones.asignacion_id', '=', 'asignaciones.id')
            ->join('iaps', 'asignaciones.iap_id', '=', 'iaps.id')
            ->join('inventarios', 'detalle_asignaciones.inventario_id', '=', 'inventarios.id')
            ->select(
                'detalle_asignaciones.id',
                'iaps.nombre_iap',
                'inventarios.nombre_producto as producto_nombre',
                'detalle_asignaciones.cantidad',
                'detalle_asignaciones.created_at as fecha',
                'detalle_asignaciones.estatus',
                'detalle_asignaciones.fecha_entrega'
            )
            ->where('detalle_asignaciones.estatus', 'pendiente') // Solo mostramos pendientes
            ->orderByDesc('detalle_asignaciones.created_at')
            ->get();

        return response()->json($asignaciones);
    }

    public function historial()
    {
        $historial = Entrega::join('iaps', 'entregas.iap_id', '=', 'iaps.id')
            ->join('detalle_entregas', 'entregas.id', '=', 'detalle_entregas.entrega_id')
            ->join('inventarios', 'detalle_entregas.inventario_id', '=', 'inventarios.id')
            ->select(
                'entregas.id as entrega_id',
                'entregas.fecha_entrega',
                'entregas.responsable_entrega',
                'entregas.lugar_entrega',
                'iaps.nombre_iap',
                'inventarios.nombre_producto',
                'detalle_entregas.cantidad_entregada as cantidad'
            )
            ->orderByDesc('entregas.created_at')
            ->get();

        return response()->json($historial);
    }

    /**
     * 🧠 ALGORITMO DE ASIGNACIÓN V2 (SOPORTE LISTAS Y FILTRO ESTRICTO)
     */
    public function sugerirAsignacion($inventarioId)
    {
        $producto = Inventario::find($inventarioId);

        if (!$producto) return response()->json([]);

        // Opcional: Podrías agregar aquí que si cantidad_actual es 0, no sugiera nada.
        // if ($producto->cantidad_actual <= 0) return response()->json([]);

        $prodNombre = strtoupper(trim($producto->nombre_producto));
        $prodCat    = strtoupper(trim($producto->categoria_producto));

        // 1. FILTROS LEGALES
        $candidatos = Iap::where('estatus', 'Activa')
            ->where('es_certificada', true)
            ->where('tiene_donataria_autorizada', true)
            ->where('tiene_padron_beneficiarios', true)
            ->get();

        $sugerencias = $candidatos->map(function ($iap) use ($prodNombre, $prodCat) {
            $puntaje = 0;
            $razones = [];

            // Datos normalizados
            $necPrim = strtoupper($iap->necesidad_primaria ?? '');
            $necComp = strtoupper($iap->necesidad_complementaria ?? '');
            $rubro   = strtoupper($iap->rubro ?? '');
            $actividad = strtoupper($iap->actividad_asistencial ?? '');
            $clase = strtoupper($iap->clasificacion);

            // Helper de coincidencia
            $verificarMatchEnLista = function ($listaString, $busqueda) {
                if (empty($listaString)) return false;
                $items = explode(',', $listaString);
                foreach ($items as $item) {
                    $itemLimpio = trim($item);
                    if (empty($itemLimpio)) continue;
                    if (str_contains($busqueda, $itemLimpio) || str_contains($itemLimpio, $busqueda)) {
                        return true;
                    }
                }
                return false;
            };

            // Detección de Match
            $tipoMatch = 'NINGUNO';

            if ($verificarMatchEnLista($necPrim, $prodNombre)) {
                $tipoMatch = 'PRIMARIA';
            } elseif ($verificarMatchEnLista($necComp, $prodNombre)) {
                $tipoMatch = 'COMPLEMENTARIA';
            } else {
                if ($verificarMatchEnLista($necPrim, $prodCat) || $verificarMatchEnLista($necComp, $prodCat)) {
                    $tipoMatch = 'CATEGORIA';
                } else {
                    $esAfin = false;
                    if ($prodCat === 'ALIMENTOS' && (str_contains($rubro, 'ALIMENT') || str_contains($rubro, 'NUTRICI') || str_contains($actividad, 'COMEDOR'))) $esAfin = true;
                    if ($prodCat === 'MEDICAMENTOS' && (str_contains($rubro, 'SALUD') || str_contains($rubro, 'MÉDIC') || str_contains($rubro, 'HOSPITAL') || str_contains($rubro, 'REHABILITA'))) $esAfin = true;
                    if ($prodCat === 'ROPA' && (str_contains($rubro, 'VESTIDO') || str_contains($rubro, 'VIVIENDA') || str_contains($rubro, 'ASILO'))) $esAfin = true;
                    if ($prodCat === 'ALIMENTOS' && in_array($clase, ['A1', 'A2', 'A3', 'A4'])) $esAfin = true;

                    if ($esAfin) $tipoMatch = 'CATEGORIA';
                }
            }

            if ($tipoMatch === 'NINGUNO') return null;

            // Calculo de Puntaje
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
        })
            ->filter();

        return response()->json($sugerencias->sortByDesc('puntaje')->values());
    }
}
