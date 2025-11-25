<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RecordatorioController extends Controller
{
    public function index()
{
    return response()->json(\App\Models\Recordatorio::all());
}

public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string',
        'date'  => 'required|date',
    ]);
    $recordatorio = \App\Models\Recordatorio::create($validated);
    return response()->json($recordatorio, 201);
}

public function update(Request $request, $id)
{
    $recordatorio = \App\Models\Recordatorio::findOrFail($id);
    $recordatorio->update($request->all()); // Para marcar como 'done'
    return response()->json($recordatorio);
}
}