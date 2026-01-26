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
                DB::raw('COALESCE(catalogo_productos.id, inventarios.id * -1) as id'),
                DB::raw('COALESCE(catalogo_productos.nombre, inventarios.nombre_producto) as nombre_producto'),
                'catalogo_productos.categoria as categoria_producto',
                'catalogo_productos.unidad_medida as unidad_medida',
                'catalogo_productos.clave_sat',

                // --- CAMPOS QUE FALTABAN ---
                'inventarios.estado',          // <--- AGREGADO: Para la columna "Condición"
                'inventarios.fecha_caducidad', // <--- AGREGADO: Para la columna "Caducidad"
                // ---------------------------

                DB::raw('SUM(inventarios.cantidad) as cantidad'),
                DB::raw('SUM(inventarios.cantidad) as stock_actual'),
                DB::raw('SUM(inventarios.monto_deducible_total) as precio_total')
            )
            ->when($search, function ($q) use ($search) {
                return $q->where(function ($query) use ($search) {
                    $query->where('catalogo_productos.nombre', 'ILIKE', "%$search%")
                        ->orWhere('inventarios.nombre_producto', 'ILIKE', "%$search%");
                });
            })
            ->groupBy(
                'catalogo_productos.id',
                'catalogo_productos.nombre',
                'catalogo_productos.categoria',
                'catalogo_productos.unidad_medida',
                'catalogo_productos.clave_sat',
                'inventarios.nombre_producto',
                'inventarios.id', // Agrupar por ID de inventario mantiene el detalle de lotes

                // --- AGREGAR TAMBIÉN AL GROUP BY ---
                'inventarios.estado',
                'inventarios.fecha_caducidad'
            )
            ->having(DB::raw('SUM(inventarios.cantidad)'), '>', 0)
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
            ->where('inventarios.cantidad', '>', 0)
            ->select(
                'inventarios.id as lote_id',
                'inventarios.cantidad',
                'inventarios.estado',
                'inventarios.fecha_caducidad',
                'inventarios.modalidad',

                // Usamos los nombres reales para mostrar precios en el detalle también
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
}
