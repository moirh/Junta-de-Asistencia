<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
    public function index()
    {
        // CORRECCIÓN: Consultamos directamente la tabla real 'inventarios'
        // Como 'EntregaController' ya descuenta el stock al hacer salidas, 
        // la columna 'cantidad' representa el STOCK ACTUAL REAL.
        
        $inventario = DB::table('inventarios')
            ->select(
                'nombre_producto',
                'categoria_producto',
                'clave_unidad',
                DB::raw('SUM(cantidad) as stock_actual'), // Sumamos lo que hay vivo
                DB::raw('COUNT(*) as total_lotes')       // Cuántos registros forman ese stock
            )
            ->where('cantidad', '>', 0) // Solo traemos productos con existencia
            ->groupBy('nombre_producto', 'categoria_producto', 'clave_unidad')
            ->orderBy('nombre_producto')
            ->get();

        return response()->json($inventario);
    }
}