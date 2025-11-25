<?php

namespace App\Http\Controllers;

use App\Models\Acuerdo;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AcuerdoController extends Controller
{
    public function index()
    {
        // Borra acuerdos antiguos y devuelve los vigentes
        Acuerdo::where('date', '<', Carbon::now()->toDateString())->delete();
        return response()->json(Acuerdo::orderBy('date', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
        ]);

        $acuerdo = Acuerdo::create($validated);
        return response()->json($acuerdo, 201);
    }

    // --- AGREGAR ESTA FUNCIÓN ---
    public function update(Request $request, $id)
    {
        $acuerdo = Acuerdo::findOrFail($id);
        
        // Si se marca como "done" (hecho), lo eliminamos
        if ($request->boolean('done')) {
            $acuerdo->delete();
            return response()->json(null, 204); 
        }
        
        $acuerdo->update($request->all());
        return response()->json($acuerdo);
    }
    // ----------------------------

    public function destroy($id)
    {
        $acuerdo = Acuerdo::findOrFail($id);
        $acuerdo->delete();
        return response()->json(null, 204);
    }
}