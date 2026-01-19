<?php

namespace App\Http\Controllers;

use App\Models\Donante;
use Illuminate\Http\Request;

class DonanteController extends Controller
{
    public function index()
    {
        // Ordenamos por razon_social, ya no por id_donantes
        return response()->json(Donante::orderBy('razon_social', 'asc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'razon_social' => 'required|string|max:255',
            'contacto' => 'required|string',
            'estatus' => 'required',
        ]);

        $donante = Donante::create($request->all());

        return response()->json($donante, 201);
    }

    public function update(Request $request, $id)
    {
        $donante = Donante::findOrFail($id);
        $donante->update($request->all());
        return response()->json($donante);
    }

    public function destroy($id)
    {
        $donante = Donante::findOrFail($id);
        $donante->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}