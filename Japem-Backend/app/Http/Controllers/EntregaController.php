<?php

namespace App\Http\Controllers;

use App\Models\Entrega;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntregaController extends Controller
{
    /**
     * Procesa la entrega, genera el historial y actualiza el contador de la IAP.
     * Esta función unifica toda la lógica de salida de almacén.
     */
    public function procesarEntrega(Request $request)
    {
        // 1. Validaciones básicas
        $request->validate([
            'asignacion_id' => 'required',
            'responsable_entrega' => 'required|string',
            'lugar_entrega' => 'required|string',
        ]);

        try {
            DB::beginTransaction(); // Iniciamos la transacción segura

            // 2. Buscamos el detalle de la asignación (La "fila" que el usuario seleccionó)
            $detalle = DB::table('detalle_asignaciones')
                ->where('id', $request->asignacion_id)
                ->first();

            if (!$detalle) {
                return response()->json(['message' => 'Error: No se encontró el detalle de la asignación.'], 404);
            }

            // 3. Buscamos a la Asignación "Padre" para obtener el ID real de la IAP
            $asignacionPadre = DB::table('asignaciones')
                ->where('id', $detalle->asignacion_id)
                ->first();
            
            if (!$asignacionPadre) {
                throw new \Exception("Error de Integridad: El detalle #{$detalle->id} no tiene una asignación padre vinculada.");
            }
            
            $iapId = $asignacionPadre->iap_id; // Recuperamos el ID correcto de la IAP

            // 4. Creamos el registro maestro en 'entregas'
            // AQUÍ es donde SÍ se guardan el responsable y el lugar
            $nuevaEntrega = Entrega::create([
                'iap_id' => $iapId,
                'fecha_entrega' => now(),
                'responsable_entrega' => $request->responsable_entrega,
                'lugar_entrega' => $request->lugar_entrega,
                'observaciones_generales' => 'Entrega confirmada desde Mesa de Control. Ref Detalle #' . $detalle->id
            ]);

            // 5. Recuperamos el nombre del producto
            $nombreProducto = DB::table('inventarios')
                ->where('id', $detalle->inventario_id)
                ->value('nombre_producto');

            // 6. Guardamos el detalle histórico de la entrega
            DB::table('detalle_entregas')->insert([
                'entrega_id' => $nuevaEntrega->id,
                'inventario_id' => $detalle->inventario_id,
                'nombre_producto' => $nombreProducto ?? 'Producto (Nombre no disponible)',
                'cantidad_entregada' => $detalle->cantidad,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // 7. Actualizamos el estatus en la Mesa de Control (Para que salga verde "ENTREGADO")
            // --- CORRECCIÓN: Solo actualizamos lo que existe en esta tabla ---
            DB::table('detalle_asignaciones')
                ->where('id', $request->asignacion_id)
                ->update([
                    'estatus' => 'procesado',
                    'fecha_entrega' => now(),
                    'updated_at' => now()
                ]);

            // 8. ACTUALIZACIÓN DEL CONTADOR DE LA IAP
            if ($iapId) {
                DB::table('iaps')
                    ->where('id', $iapId)
                    ->increment('veces_donado');
            }

            DB::commit(); // Confirmamos todos los cambios en la BD

            return response()->json([
                'message' => 'Entrega registrada exitosamente y contador de IAP actualizado.',
                'folio' => $nuevaEntrega->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack(); // Si algo falla, deshacemos todo
            return response()->json(['message' => 'Error del Servidor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Muestra las asignaciones pendientes en la Mesa de Control.
     */
    public function pendientes()
    {
        $asignaciones = DB::table('detalle_asignaciones')
            ->join('asignaciones', 'detalle_asignaciones.asignacion_id', '=', 'asignaciones.id')
            ->join('iaps', 'asignaciones.iap_id', '=', 'iaps.id')
            ->join('inventarios', 'detalle_asignaciones.inventario_id', '=', 'inventarios.id')
            ->select(
                'detalle_asignaciones.id',
                'iaps.nombre_iap',
                'inventarios.nombre_producto as producto_nombre', // Alias para el Frontend
                'detalle_asignaciones.cantidad',
                'detalle_asignaciones.created_at as fecha',
                'detalle_asignaciones.estatus',
                'detalle_asignaciones.fecha_entrega'
            )
            ->orderByDesc('detalle_asignaciones.created_at')
            ->get();

        return response()->json($asignaciones);
    }

    /**
     * Muestra el historial completo de entregas pasadas.
     */
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
}