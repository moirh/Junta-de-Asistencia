<?php

namespace App\Http\Controllers;

use App\Models\Iap;
use App\Models\Inventario;
use App\Models\Entrega; // Crearemos este modelo en un momento
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntregaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'iap_id' => 'required|exists:iaps,id',
            'detalles' => 'required|array|min:1' // Lista de productos a entregar
        ]);

        return DB::transaction(function () use ($request) {
            $iap = Iap::findOrFail($request->iap_id);
            
            // 1. Recorremos los productos que queremos entregar
            foreach ($request->detalles as $item) {
                $cantidad_a_entregar = $item['cantidad'];
                $nombre_producto = $item['nombre_producto'];

                // 2. Buscamos lotes en inventario que tengan ese producto (FIFO: Primero en entrar, primero en salir)
                // Ojo: Buscamos por nombre para descontar de cualquier donativo disponible
                $lotes = Inventario::where('nombre_producto', $nombre_producto)
                                   ->where('cantidad', '>', 0)
                                   ->orderBy('created_at', 'asc') // Los más viejos primero
                                   ->get();

                $restante = $cantidad_a_entregar;

                foreach ($lotes as $lote) {
                    if ($restante <= 0) break;

                    if ($lote->cantidad >= $restante) {
                        // El lote tiene suficiente, descontamos todo de aquí
                        $lote->cantidad -= $restante;
                        $lote->save();
                        $restante = 0;
                    } else {
                        // El lote no alcanza, lo vaciamos y seguimos con el siguiente
                        $restante -= $lote->cantidad;
                        $lote->cantidad = 0;
                        $lote->save();
                    }
                }

                if ($restante > 0) {
                    throw new \Exception("No hay suficiente stock de $nombre_producto. Faltan $restante unidades.");
                }
            }

            // 3. Aumentamos el contador de "Veces Donado" a la IAP (para equidad)
            $iap->increment('veces_donado');

            return response()->json(['message' => 'Entrega exitosa. Inventario actualizado.']);
        });
    }
}