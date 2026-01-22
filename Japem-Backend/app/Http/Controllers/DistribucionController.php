<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DistribucionController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validamos los datos básicos
        $request->validate([
            'iap_id' => 'required|exists:iaps,id', 
            'detalles' => 'required|array',
            'detalles.*.inventario_id' => 'required|exists:inventarios,id',
            'detalles.*.cantidad' => 'required|numeric|min:1',
        ]);

        try {
            DB::beginTransaction(); 

            // --- PASO 1: CREAR LA ASIGNACIÓN PADRE (EL "FOLIO") ---
            // Esto crea el registro en la tabla 'asignaciones' y nos devuelve el ID nuevo
            $idAsignacion = DB::table('asignaciones')->insertGetId([
                'iap_id' => $request->iap_id,
                // Si tienes un campo de fecha_asignacion, descomenta esto:
                // 'fecha_asignacion' => now(), 
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // --- PASO 2: PROCESAR LOS PRODUCTOS ---
            foreach ($request->detalles as $detalle) {
                $idRecibido = $detalle['inventario_id'];
                $cantidadSolicitada = $detalle['cantidad'];

                $productoReferencia = DB::table('inventarios')->where('id', $idRecibido)->first();

                if (!$productoReferencia) {
                    throw new \Exception("El producto con ID $idRecibido no existe.");
                }

                // Buscamos lotes (FIFO)
                $lotes = DB::table('inventarios')
                    ->where('nombre_producto', $productoReferencia->nombre_producto)
                    ->where('cantidad', '>', 0)
                    ->orderBy('id', 'asc') 
                    ->lockForUpdate() 
                    ->get();

                $stockTotal = $lotes->sum('cantidad');

                if ($stockTotal < $cantidadSolicitada) {
                    throw new \Exception("Stock insuficiente para '{$productoReferencia->nombre_producto}'. Solicitado: $cantidadSolicitada, Disponible: $stockTotal");
                }

                // Algoritmo de resta (FIFO)
                $pendientePorRestar = $cantidadSolicitada;
                
                // Variable para guardar qué ID de inventario usamos para el registro (usaremos el del último lote tocado o el principal)
                $inventarioIdFinal = $idRecibido; 

                foreach ($lotes as $lote) {
                    if ($pendientePorRestar <= 0) break;
                    
                    $inventarioIdFinal = $lote->id; // Actualizamos el ID del lote que estamos usando

                    if ($lote->cantidad >= $pendientePorRestar) {
                        DB::table('inventarios')
                            ->where('id', $lote->id)
                            ->update(['cantidad' => $lote->cantidad - $pendientePorRestar]);
                        $pendientePorRestar = 0;
                    } else {
                        $pendientePorRestar -= $lote->cantidad; 
                        DB::table('inventarios')
                            ->where('id', $lote->id)
                            ->update(['cantidad' => 0]);
                    }
                }

                // --- PASO 3: GUARDAR EL DETALLE VINCULADO AL PADRE ---
                DB::table('detalle_asignaciones')->insert([
                    'asignacion_id' => $idAsignacion, // <--- AQUÍ USAMOS LA ID REAL CREADA ARRIBA
                    'inventario_id' => $inventarioIdFinal, 
                    'cantidad' => $cantidadSolicitada,
                    'iap_id' => $request->iap_id,
                    'producto_nombre' => $productoReferencia->nombre_producto,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit(); 

            return response()->json(['message' => 'Asignación realizada exitosamente'], 201);

        } catch (\Exception $e) {
            DB::rollBack(); 
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 422);
        }
    }

    public function historial()
    {
        $entregas = DB::table('detalle_asignaciones')
            ->join('iaps', 'detalle_asignaciones.iap_id', '=', 'iaps.id')
            ->select(
                'detalle_asignaciones.id',
                'detalle_asignaciones.producto_nombre',
                'detalle_asignaciones.cantidad',
                'detalle_asignaciones.created_at as fecha',
                'iaps.nombre_iap' 
            )
            ->orderByDesc('detalle_asignaciones.created_at')
            ->get();

        return response()->json($entregas);
    }
}