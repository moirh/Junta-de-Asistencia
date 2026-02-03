<?php

namespace App\Http\Controllers;

use App\Models\Donativo;
use App\Models\Inventario;
use App\Models\CatalogoProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonativoController extends Controller
{
    public function index()
    {
        // Carga ansiosa explícita para asegurar que trae los precios de venta
        return Donativo::with([
            'donante',
            'inventarios' => function ($query) {
                // Seleccionamos explícitamente todas las columnas necesarias
                // O simplemente deja $query->select('*'); si quieres todo.
                $query->select(
                    'id',
                    'donativo_id',
                    'nombre_producto',
                    'cantidad',
                    'cantidad_actual',
                    'clave_unidad',
                    'precio_unitario_deducible',
                    'monto_deducible_total',
                    // --- ESTOS SON LOS IMPORTANTES QUE FALTABAN ---
                    'precio_venta_unitario',
                    'precio_venta_total'
                );
            }
        ])
            ->orderBy('fecha_donativo', 'desc')
            ->get();
    }

    public function catalogo()
    {
        return CatalogoProducto::select('nombre', 'categoria', 'unidad_medida')
            ->orderBy('nombre')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'donante_id' => 'required',
            'fecha_donativo' => 'required|date',
            'detalles' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            $donativo = Donativo::create([
                'donante_id' => $request->donante_id,
                'fecha_donativo' => $request->fecha_donativo,
                'monto_total_deducible' => 0,
                'observaciones' => $request->observaciones ?? ''
            ]);

            $totalAcumuladoDonacion = 0;

            foreach ($request->detalles as $detalle) {
                // ... lógica de precios igual ...
                $precioDeducible = $detalle['precio_unitario'] ?? $detalle['precio_unitario_deducible'] ?? 0;
                $precioVenta = $detalle['precio_venta'] ?? $detalle['precio_venta_unitario'] ?? 0;
                $cantidad = $detalle['cantidad'];
                $subtotalDeducible = $cantidad * $precioDeducible;

                $totalAcumuladoDonacion += $subtotalDeducible;

                $nombreLimpio = mb_strtoupper(trim($detalle['nombre_producto']), 'UTF-8');

                $productoCatalogo = CatalogoProducto::firstOrCreate(
                    ['nombre' => $nombreLimpio],
                    [
                        'categoria' => $detalle['categoria_producto'],
                        'clave_sat' => $detalle['clave_sat'] ?? '01010101',
                        'unidad_medida' => $detalle['clave_unidad'],
                        'precio_referencia' => $precioDeducible
                    ]
                );

                // CAMBIO 2: Guardamos cantidad_actual
                Inventario::create([
                    'donativo_id' => $donativo->id,
                    'catalogo_producto_id' => $productoCatalogo->id,
                    'nombre_producto' => $nombreLimpio,

                    // --- AQUÍ ESTÁ LA MAGIA ---
                    'cantidad' => $cantidad,        // Fijo (Histórico de Entrada)
                    'cantidad_actual' => $cantidad, // Variable (Stock Disponible)
                    // --------------------------

                    'estado' => $detalle['estado'],
                    'modalidad' => $detalle['modalidad'],
                    'fecha_caducidad' => $detalle['fecha_caducidad'] ?? null,
                    'clave_unidad' => $productoCatalogo->unidad_medida,
                    'categoria_producto' => $productoCatalogo->categoria,
                    'clave_sat' => $detalle['clave_sat'] ?? '01010101',
                    'precio_unitario_deducible' => $precioDeducible,
                    'monto_deducible_total' => $subtotalDeducible,
                    'precio_venta_unitario' => $precioVenta,
                    'precio_venta_total' => $cantidad * $precioVenta,
                ]);
            }

            $donativo->update([
                'monto_total_deducible' => $totalAcumuladoDonacion
            ]);

            DB::commit();
            return response()->json(['message' => 'Donativo registrado correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
