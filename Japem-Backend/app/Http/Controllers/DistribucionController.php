<?php

namespace App\Http\Controllers;

use App\Models\Asignacion;
use App\Models\DetalleAsignacion;
use App\Models\Inventario;
use App\Models\Iap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DistribucionController extends Controller
{
    public function index()
    {
        return Asignacion::with(['iap', 'detalles.inventario'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        // 1. Validaciones
        $request->validate([
            'iap_id' => 'required|exists:iaps,id',
            'detalles' => 'required|array',
            'detalles.*.inventario_id' => 'required|exists:inventarios,id',
            'detalles.*.cantidad' => 'required|numeric|min:1',
        ]);

        try {
            DB::beginTransaction();

            // 2. Validar stock disponible (SIN RESTAR AÚN)
            // Agrupamos por producto para evitar duplicados en la validación
            foreach ($request->detalles as $detalle) {
                $inventario = Inventario::find($detalle['inventario_id']);

                // CORRECCIÓN CLAVE: Validamos contra 'cantidad_actual'
                if ($inventario->cantidad_actual < $detalle['cantidad']) {
                    throw new \Exception("Stock insuficiente para '{$inventario->nombre_producto}'. Disponible: {$inventario->cantidad_actual}");
                }
            }

            // 3. Crear la Asignación (Cabecera)
            $asignacion = Asignacion::create([
                'iap_id' => $request->iap_id,
                'estatus' => 'pendiente', // Importante: Nace pendiente de entrega
                'fecha_asignacion' => now(),
            ]);

            // 4. Guardar los detalles
            foreach ($request->detalles as $detalle) {
                DetalleAsignacion::create([
                    'asignacion_id' => $asignacion->id,
                    'inventario_id' => $detalle['inventario_id'],
                    'cantidad' => $detalle['cantidad'],
                    'estatus' => 'pendiente'
                ]);
            }

            // NOTA: No hacemos update/decrement aquí. 
            // Eso sucederá cuando se confirme la "Entrega".

            DB::commit();

            return response()->json([
                'message' => 'Asignación registrada correctamente. Lista para entrega.',
                'folio' => $asignacion->id
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return Asignacion::with(['iap', 'detalles.inventario'])->find($id);
    }

    public function destroy($id)
    {
        $asignacion = Asignacion::find($id);
        if (!$asignacion) return response()->json(['message' => 'No encontrado'], 404);

        // Solo permitir borrar si no se ha procesado
        if ($asignacion->estatus === 'procesado') {
            return response()->json(['message' => 'No se puede eliminar una asignación ya entregada'], 400);
        }

        $asignacion->detalles()->delete(); // Borrar detalles hijos
        $asignacion->delete(); // Borrar padre

        return response()->json(['message' => 'Asignación eliminada']);
    }
}
