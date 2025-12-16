<?php

namespace App\Http\Controllers;

use App\Models\Donante;
use Illuminate\Http\Request;

class DonanteController extends Controller
{
    /**
     * Mostrar todos los donantes.
     */
    public function index()
    {
        // ❌ Eliminado 'with('catalogo')'
        return response()->json(Donante::orderBy('id_donantes', 'asc')->get());
    }

    /**
     * Mostrar un donante por ID.
     */
    public function show($id)
    {
        // ❌ Eliminado 'with('catalogo')'
        $donante = Donante::find($id);

        if (!$donante) {
            return response()->json(['message' => 'Donante no encontrado'], 404);
        }

        return response()->json($donante);
    }

    /**
     * Crear un nuevo donante.
     */
    public function store(Request $request)
    {
        // Validamos solo los campos de la tabla donantes
        $request->validate([
            'fecha' => 'required|date',
            'no_oficio' => 'required|string|max:22',
            'donante' => 'required|string|max:255',
            'municipio' => 'required|string|max:100',
            'descripcion' => 'required|string|max:500',
            'costo_total' => 'required|numeric|min:0',
            'nota' => 'nullable|string|max:255',
        ]);

        // Creamos el donante directamente (sin transacciones complejas ni catálogos)
        $donante = Donante::create($request->all());

        return response()->json([
            'message' => 'Donante creado correctamente',
            'data' => $donante // ❌ Ya no cargamos relación 'catalogo'
        ], 201);
    }

    /**
     * Actualizar un donante existente.
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
        ]);

        // Actualizamos directamente
        $donante->update($request->all());

        return response()->json([
            'message' => 'Donante actualizado correctamente',
            'data' => $donante
        ]);
    }
    
    public function destroy($id)
    {
        $donante = Donante::find($id);
        if (!$donante) return response()->json(['message' => 'No encontrado'], 404);
        
        $donante->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}