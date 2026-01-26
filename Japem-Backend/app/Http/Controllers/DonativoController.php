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
        return Donativo::with(['donante', 'detalles'])->orderBy('fecha_donativo', 'desc')->get();
    }

    public function catalogo()
    {
        return CatalogoProducto::select('nombre', 'categoria', 'unidad_medida')
            ->orderBy('nombre')
            ->get();
    }

    public function store(Request $request)
    {
        // 1. VALIDACIONES
        $request->validate([
            'donante_id' => 'required',
            'fecha_donativo' => 'required|date',
            'detalles' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            // 2. Crear el Donativo (Inicialmente en 0)
            $donativo = Donativo::create([
                'donante_id' => $request->donante_id,
                'fecha_donativo' => $request->fecha_donativo,
                'monto_total_deducible' => 0, // Se actualizará al final
                'observaciones' => $request->observaciones ?? ''
            ]);

            // Variable para ir sumando el dinero de todos los productos
            $totalAcumuladoDonacion = 0;

            // 3. Procesar productos
            foreach ($request->detalles as $detalle) {

                // --- CORRECCIÓN DE NOMBRES ---
                // Buscamos el precio con el nombre corto O con el nombre largo.
                // Si no encuentra ninguno, pone 0.
                $precioDeducible = $detalle['precio_unitario']
                    ?? $detalle['precio_unitario_deducible']
                    ?? 0;

                $precioVenta = $detalle['precio_venta']
                    ?? $detalle['precio_venta_unitario']
                    ?? 0;

                $cantidad = $detalle['cantidad'];

                // Calculamos el subtotal de esta línea
                $subtotalDeducible = $cantidad * $precioDeducible;

                // Sumamos al acumulador del Donativo
                $totalAcumuladoDonacion += $subtotalDeducible;
                // ------------------------------------------

                $nombreLimpio = mb_strtoupper(trim($detalle['nombre_producto']), 'UTF-8');

                // Catálogo
                $productoCatalogo = CatalogoProducto::firstOrCreate(
                    ['nombre' => $nombreLimpio],
                    [
                        'categoria' => $detalle['categoria_producto'],
                        'clave_sat' => $detalle['clave_sat'] ?? '01010101',
                        'unidad_medida' => $detalle['clave_unidad'],
                        'precio_referencia' => $precioDeducible
                    ]
                );

                // Inventario
                Inventario::create([
                    'donativo_id' => $donativo->id,
                    'catalogo_producto_id' => $productoCatalogo->id,
                    'nombre_producto' => $nombreLimpio,
                    'cantidad' => $cantidad,
                    'estado' => $detalle['estado'],
                    'modalidad' => $detalle['modalidad'],
                    'fecha_caducidad' => $detalle['fecha_caducidad'] ?? null,
                    'clave_unidad' => $productoCatalogo->unidad_medida,
                    'categoria_producto' => $productoCatalogo->categoria,
                    'clave_sat' => $detalle['clave_sat'] ?? '01010101',

                    // Precios Individuales (Hijos)
                    'precio_unitario_deducible' => $precioDeducible,
                    'monto_deducible_total' => $subtotalDeducible,

                    'precio_venta_unitario' => $precioVenta,
                    'precio_venta_total' => $cantidad * $precioVenta,
                ]);
            }

            // 4. --- PASO FINAL: ACTUALIZAR EL TOTAL DEL DONATIVO (PAPÁ) ---
            // Ahora que terminó el ciclo, ya sabemos cuánto sumó todo.
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
