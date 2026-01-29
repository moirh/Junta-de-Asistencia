<?php

namespace App\Http\Controllers;

use App\Models\Acuerdo;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AcuerdoController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // 1. Borrar antiguos (Solo si soy el dueño)
        Acuerdo::where('user_id', $userId)
            ->where('date', '<', Carbon::now()->toDateString())
            ->delete();

        // 2. RECUPERAR: Mis acuerdos (soy dueño) O los que me compartieron
        $acuerdos = Acuerdo::where('user_id', $userId) // Soy el dueño
            ->orWhereHas('compartidos', function ($q) use ($userId) {
                $q->where('user_id', $userId); // O estoy en la lista de compartidos
            })
            ->with('compartidos') // Traemos la info de con quién se compartió
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($acuerdos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'shared_with' => 'array', // <--- Nuevo campo (array de IDs)
            'shared_with.*' => 'exists:users,id' // Validar que los usuarios existan
        ]);

        $acuerdo = Acuerdo::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'date' => $validated['date'],
            'user_id' => Auth::id(), // Dueño original
            'done' => false
        ]);

        // Sincronizar compartidos (Guardar en tabla pivote)
        if (!empty($request->shared_with)) {
            $acuerdo->compartidos()->sync($request->shared_with);
        }

        return response()->json($acuerdo, 201);
    }

    public function update(Request $request, $id)
    {
        // SEGURIDAD: Busca el acuerdo, pero verifica que sea TUYO
        $acuerdo = Acuerdo::where('user_id', Auth::id())
            ->findOrFail($id);

        // Si se marca como "done" (hecho), lo eliminamos
        if ($request->boolean('done')) {
            $acuerdo->delete();
            return response()->json(null, 204);
        }

        $acuerdo->update($request->all());
        return response()->json($acuerdo);
    }

    public function destroy($id)
    {
        // SEGURIDAD: Solo borrar si me pertenece
        $acuerdo = Acuerdo::where('user_id', Auth::id())
            ->findOrFail($id);

        $acuerdo->delete();
        return response()->json(null, 204);
    }
}
