<?php

namespace App\Http\Controllers;

use App\Models\Donativo;
use App\Models\Inventario; // Asegúrate de que este sea el modelo correcto
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DonativoController extends Controller
{
    // --- ESTA ES LA FUNCIÓN QUE TE FALTABA ---
    public function index()
    {
        // Traemos la relación 'donante' y 'detalles' para la tabla
        return Donativo::with(['donante', 'detalles'])->orderBy('fecha_donativo', 'desc')->get();
    }
    // ------------------------------------------

    public function store(Request $request)
    {
        // 1. Validación básica
        $request->validate([
            'donante_id' => 'required|exists:donantes,id',
            'fecha_donativo' => 'required|date',
            'detalles' => 'required|array|min:1'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 2. Crear Cabecera
                $donativo = Donativo::create([
                    'donante_id' => $request->donante_id,
                    'fecha_donativo' => $request->fecha_donativo,
                    'monto_total_deducible' => $request->monto_total_deducible ?? 0,
                    'observaciones' => $request->observaciones,
                ]);

                // 3. Crear Detalles (Productos / Inventario)
                $productosData = [];
                foreach ($request->detalles as $prod) {
                    $productosData[] = [
                        'categoria_producto' => $prod['categoria_producto'] ?? 'GENERAL',
                        'nombre_producto' => $prod['nombre_producto'] ?? 'SIN NOMBRE',
                        'clave_sat' => $prod['clave_sat'] ?? null,
                        'modalidad' => $prod['modalidad'] ?? null,
                        'clave_unidad' => $prod['clave_unidad'] ?? null,
                        'cantidad' => (int) ($prod['cantidad'] ?? 1),
                        'precio_venta_unitario' => (float) ($prod['precio_venta_unitario'] ?? 0),
                        'precio_venta_total' => (float) ($prod['precio_venta_total'] ?? 0),
                        'precio_unitario_deducible' => (float) ($prod['precio_unitario_deducible'] ?? 0),
                        'monto_deducible_total' => (float) ($prod['monto_deducible_total'] ?? 0),
                        'estado' => $prod['estado'] ?? 'Nuevo',
                        'fecha_caducidad' => $prod['fecha_caducidad'] ?? null,
                    ];
                }
                
                // Guardar usando la relación definida en Donativo.php
                $donativo->detalles()->createMany($productosData);

                return response()->json($donativo->load('detalles'), 201);
            });

        } catch (\Exception $e) {
            Log::error('Error guardando donativo: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}