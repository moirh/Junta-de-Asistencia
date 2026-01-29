<?php

namespace App\Http\Controllers;

use App\Models\Recordatorio;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class RecordatorioController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // 1. AUTO-ELIMINAR: Borra recordatorios vencidos (ayer o antes)
        // OJO: Agregamos "where('user_id', $userId)" para que solo borre MIS vencidos,
        // no los de otros usuarios.
        Recordatorio::where('user_id', $userId)
            ->where('date', '<', Carbon::now()->toDateString())
            ->delete();

        // 2. FILTRAR: Solo devolvemos los recordatorios de ESTE usuario
        return response()->json(
            Recordatorio::where('user_id', $userId)
                ->orderBy('date', 'asc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
        ]);

        // Tu lógica estaba perfecta aquí
        $recordatorio = Recordatorio::create([
            'title' => $validated['title'],
            'date' => $validated['date'],
            'user_id' => Auth::id(), // Asignamos el dueño
            'done' => false // Valor por defecto
        ]);

        return response()->json($recordatorio, 201);
    }

    public function update(Request $request, $id)
    {
        // SEGURIDAD: Buscamos el recordatorio PERO verificamos que sea del usuario.
        // Si el ID existe pero es de otro usuario, fallará (ModelNotFound).
        $recordatorio = Recordatorio::where('user_id', Auth::id())
            ->findOrFail($id);

        // 2. AUTO-ELIMINAR POR PALOMITA
        if ($request->boolean('done')) {
            $recordatorio->delete();
            return response()->json(null, 204);
        }

        // Actualización normal
        $recordatorio->update($request->all());
        return response()->json($recordatorio);
    }

    public function destroy($id)
    {
        // SEGURIDAD: Solo borrar si me pertenece
        $recordatorio = Recordatorio::where('user_id', Auth::id())
            ->findOrFail($id);

        $recordatorio->delete();
        return response()->json(null, 204);
    }
}
