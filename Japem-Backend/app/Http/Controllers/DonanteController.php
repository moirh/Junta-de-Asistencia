<?php

namespace App\Http\Controllers;

use App\Models\Donante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Importante para las transacciones

class DonanteController extends Controller
{
    /**
     * Mostrar todos los donantes con su catálogo.
     */
    public function index()
    {
        // Usamos 'with' para traer los artículos del catálogo relacionados
        return response()->json(Donante::with('catalogo')->orderBy('id_donantes', 'asc')->get());
    }

    /**
     * Mostrar un donante por ID con su catálogo.
     */
    public function show($id)
    {
        $donante = Donante::with('catalogo')->find($id);

        if (!$donante) {
            return response()->json(['message' => 'Donante no encontrado'], 404);
        }

        return response()->json($donante);
    }

    /**
     * Crear un nuevo donante y sus artículos de catálogo.
     */
    public function store(Request $request)
    {
        // Validamos los campos del donante y el array del catálogo
        $request->validate([
            'fecha' => 'required|date',
            'no_oficio' => 'required|string|max:22',
            'donante' => 'required|string|max:255',
            'municipio' => 'required|string|max:100',
            'descripcion' => 'required|string|max:500',
            'costo_total' => 'required|numeric|min:0',
            'nota' => 'nullable|string|max:255',
            
            // Validación para el array de catálogo (opcional)
            'catalogo' => 'nullable|array',
            'catalogo.*.articulo' => 'required_with:catalogo|string|max:100',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Crear el Donante (excluyendo el array catalogo)
            $donanteData = $request->except(['catalogo']);
            $donante = Donante::create($donanteData);

            // 2. Crear los artículos del catálogo si vienen en la petición
            if ($request->has('catalogo') && is_array($request->catalogo)) {
                foreach ($request->catalogo as $item) {
                    $donante->catalogo()->create([
                        'articulo' => $item['articulo']
                    ]);
                }
            }

            return response()->json([
                'message' => 'Donante creado correctamente',
                'data' => $donante->load('catalogo')
            ], 201);
        });
    }

    /**
     * Actualizar un donante existente y sincronizar su catálogo.
     */
    public function update(Request $request, $id)
    {
        $donante = Donante::find($id);

        if (!$donante) {
            return response()->json(['message' => 'Donante no encontrado'], 404);
        }

        $request->validate([
            'fecha' => 'required|date',
            'no_oficio' => 'required|string|max:22',
            'donante' => 'required|string|max:255',
            'municipio' => 'required|string|max:100',
            'descripcion' => 'required|string|max:500',
            'costo_total' => 'required|numeric|min:0',
            'nota' => 'nullable|string|max:255',
            
            'catalogo' => 'nullable|array',
            'catalogo.*.articulo' => 'required_with:catalogo|string|max:100',
        ]);

        return DB::transaction(function () use ($request, $donante) {
            // 1. Actualizar datos básicos del donante
            $donanteData = $request->except(['catalogo']);
            $donante->update($donanteData);

            // 2. Actualizar el catálogo
            // Estrategia: Borrar los anteriores y crear los nuevos (Sync simple)
            if ($request->has('catalogo')) {
                // Borramos los items actuales asociados a este donante
                $donante->catalogo()->delete();

                // Creamos los nuevos items
                if (is_array($request->catalogo)) {
                    foreach ($request->catalogo as $item) {
                        $donante->catalogo()->create([
                            'articulo' => $item['articulo']
                        ]);
                    }
                }
            }

            return response()->json([
                'message' => 'Donante actualizado correctamente',
                'data' => $donante->load('catalogo')
            ]);
        });
    }
}