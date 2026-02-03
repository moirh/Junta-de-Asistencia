<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
    /**
     * VISTA GENERAL: Resumen de Stock
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $inventario = DB::table('inventarios')
            ->leftJoin('catalogo_productos', 'inventarios.catalogo_producto_id', '=', 'catalogo_productos.id')
            ->select(
                // 1. ID y NOMBRE
                DB::raw('MAX(COALESCE(catalogo_productos.id, inventarios.id * -1)) as id'),
                DB::raw('COALESCE(catalogo_productos.nombre, inventarios.nombre_producto) as nombre_producto'),

                // 2. DATOS DEL CATÁLOGO
                DB::raw('MAX(catalogo_productos.categoria) as categoria_producto'),
                DB::raw('MAX(catalogo_productos.unidad_medida) as unidad_medida'),

                // 3. CLAVE SAT
                DB::raw('MAX(COALESCE(catalogo_productos.clave_sat, inventarios.clave_sat)) as clave_sat'),

                // 4. DATOS DE INVENTARIO
                DB::raw('MAX(inventarios.estado) as estado'),
                DB::raw('MIN(inventarios.fecha_caducidad) as fecha_caducidad'),

                // 5. SUMATORIAS
                DB::raw('SUM(inventarios.cantidad) as cantidad_historica'), // Para saber cuánto entró en total
                DB::raw('SUM(inventarios.cantidad_actual) as cantidad_actual'),
                DB::raw('SUM(inventarios.cantidad_actual) as stock_actual'),
                DB::raw('SUM(inventarios.monto_deducible_total) as precio_total')
            )
            ->when($search, function ($q) use ($search) {
                return $q->where(function ($query) use ($search) {
                    $query->where('catalogo_productos.nombre', 'ILIKE', "%$search%")
                        ->orWhere('inventarios.nombre_producto', 'ILIKE', "%$search%");
                });
            })
            ->groupBy(
                DB::raw('COALESCE(catalogo_productos.nombre, inventarios.nombre_producto)')
            )
            // FILTRO: Solo mostramos lo que tenga stock real disponible
            ->having(DB::raw('SUM(inventarios.cantidad_actual)'), '>', 0)
            ->orderBy(DB::raw('COALESCE(catalogo_productos.nombre, inventarios.nombre_producto)'))
            ->get();

        return response()->json($inventario);
    }

    /**
     * VISTA DETALLADA: Ver Lotes
     */
    public function detalles($catalogoId)
    {
        $producto = DB::table('catalogo_productos')->where('id', $catalogoId)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $lotes = DB::table('inventarios')
            ->join('donativos', 'inventarios.donativo_id', '=', 'donativos.id')
            ->where('inventarios.catalogo_producto_id', $catalogoId)
            // CAMBIO: Filtramos por stock actual > 0
            ->where('inventarios.cantidad_actual', '>', 0)
            ->select(
                'inventarios.id as lote_id',
                'inventarios.cantidad as cantidad_inicial', // Dato informativo
                'inventarios.cantidad_actual',              // <--- STOCK REAL DEL LOTE
                'inventarios.estado',
                'inventarios.fecha_caducidad',
                'inventarios.modalidad',
                'inventarios.precio_unitario_deducible as precio_unitario',
                'donativos.folio_donativo',
                'donativos.fecha_donativo as fecha_recepcion'
            )
            ->orderBy('donativos.fecha_donativo', 'asc') // FIFO
            ->get();

        return response()->json([
            'producto_info' => $producto,
            'lotes' => $lotes
        ]);
    }

    /**
     * ACTUALIZAR PRECIOS (NUEVO MÉTODO)
     * Recibe un array de items y actualiza sus precios de venta/recuperación.
     */
    public function updatePrices(Request $request)
    {
        // Obtenemos todos los datos enviados (debe ser un array de objetos)
        $items = $request->all();

        if (!is_array($items)) {
            return response()->json(['message' => 'Formato de datos inválido'], 400);
        }

        try {
            DB::beginTransaction();

            foreach ($items as $item) {
                // Verificamos que el item tenga ID (es crucial para saber qué actualizar)
                if (isset($item['id'])) {
                    DB::table('inventarios')
                        ->where('id', $item['id'])
                        ->update([
                            'precio_venta_unitario' => $item['precio_venta_unitario'] ?? 0,
                            'precio_venta_total'    => $item['precio_venta_total'] ?? 0,
                            // 'updated_at' => now() // Opcional si usas timestamps
                        ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Precios actualizados correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar precios',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
