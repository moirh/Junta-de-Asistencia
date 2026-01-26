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
                // 1. ID y NOMBRE: Usamos MAX para que colapse todo en una sola línea
                DB::raw('MAX(COALESCE(catalogo_productos.id, inventarios.id * -1)) as id'),
                DB::raw('COALESCE(catalogo_productos.nombre, inventarios.nombre_producto) as nombre_producto'),

                // 2. DATOS DEL CATÁLOGO: Usamos MAX para ignorar nulos
                DB::raw('MAX(catalogo_productos.categoria) as categoria_producto'),
                DB::raw('MAX(catalogo_productos.unidad_medida) as unidad_medida'),

                // 3. CLAVE SAT (LA SOLUCIÓN): Busca el valor MÁXIMO (ignora nulos) entre las dos tablas
                DB::raw('MAX(COALESCE(catalogo_productos.clave_sat, inventarios.clave_sat)) as clave_sat'),

                // 4. DATOS DE INVENTARIO:
                DB::raw('MAX(inventarios.estado) as estado'),
                DB::raw('MIN(inventarios.fecha_caducidad) as fecha_caducidad'),

                // 5. SUMATORIAS
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
            // --- AQUÍ ESTABA EL ERROR ---
            // Borramos la lista larga y dejamos solo esto. 
            // Así obligamos a que "LENTEJAS" sea una sola fila con toda la info junta.
            ->groupBy(
                DB::raw('COALESCE(catalogo_productos.nombre, inventarios.nombre_producto)')
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
