<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;
// No necesitas 'use DB' si usamos el Modelo directamente

class InventarioController extends Controller
{
    public function index()
    {
        // Traemos todos los lotes que tengan existencias (cantidad > 0).
        // Los ordenamos por fecha de creación (created_at) ascendente para respetar el FIFO.
        // Al usar el Modelo 'Inventario', Laravel calculará automáticamente
        // el 'semaforo_rotacion' y 'dias_en_almacen' que configuramos antes.
        
        return Inventario::with('donativo')
        ->where('cantidad', '>', 0)
        ->orderBy('created_at', 'asc')
        ->get();
    }
}