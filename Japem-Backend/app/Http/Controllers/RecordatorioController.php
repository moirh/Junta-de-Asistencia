<?php

namespace App\Http\Controllers;

use App\Models\Recordatorio;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RecordatorioController extends Controller
{
    public function index()
    {
        // 1. AUTO-ELIMINAR: Borra recordatorios vencidos (ayer o antes)
        Recordatorio::where('date', '<', Carbon::now()->toDateString())->delete();

        return response()->json(Recordatorio::orderBy('date', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
        ]);

        $recordatorio = Recordatorio::create($validated);
        return response()->json($recordatorio, 201);
    }

    public function update(Request $request, $id)
    {
        $recordatorio = Recordatorio::findOrFail($id);
        
        // 2. AUTO-ELIMINAR POR PALOMITA
        // Si el usuario envía 'done' como true, borramos el registro
        if ($request->boolean('done')) {
            $recordatorio->delete();
            // Retornamos 204 No Content para indicar que se eliminó
            return response()->json(null, 204); 
        }
        
        // Si no es 'done' (ej. editar título), actualizamos normal
        $recordatorio->update($request->all());
        return response()->json($recordatorio);
    }

    public function destroy($id)
    {
        $recordatorio = Recordatorio::findOrFail($id);
        $recordatorio->delete();
        return response()->json(null, 204);
    }
}