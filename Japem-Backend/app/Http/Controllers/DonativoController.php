<?php

namespace App\Http\Controllers;

use App\Models\Donativo;
use Illuminate\Http\Request;

class DonativoController extends Controller
{
    // GET: Listar todos
    public function index()
    {
        return Donativo::orderBy('id', 'asc')->get();
    }

    // GET: Ver uno solo
    public function show($id)
    {
        $donativo = Donativo::find($id);

        if (!$donativo) {
            return response()->json(['error' => 'Donativo no encontrado'], 404);
        }

        return response()->json($donativo);
    }

    // POST: Crear
    public function store(Request $request)
    {
        // 1. Validaciones
        $request->validate([
            'id_japem' => 'required|string|max:255|unique:donativos,id_japem',
            'nombre' => 'required|string|max:255',
            // Opcionales pero recomendados para seguridad:
            'necesidad_pri' => 'nullable|string',
            'necesidad_sec' => 'nullable|string',
            'necesidad_com' => 'nullable|string',
        ]);

        // 2. Preparar datos
        $data = $request->all();

        // 3. Convertir booleanos explícitamente
        $data['certificacion'] = $request->boolean('certificacion');
        $data['candidato'] = $request->boolean('candidato');
        $data['donataria_aut'] = $request->boolean('donataria_aut');
        $data['padron_ben'] = $request->boolean('padron_ben');

        // 4. Crear registro
        $donativo = Donativo::create($data);

        return response()->json([
            'message' => 'Donativo creado correctamente',
            'data' => $donativo
        ], 201);
    }

    // PUT: Actualizar
    public function update(Request $request, $id)
    {
        $donativo = Donativo::find($id);

        if (!$donativo) {
            return response()->json(['message' => 'Donativo no encontrado'], 404);
        }

        // 1. Validaciones para Update (Importante: ignorar el ID actual en 'unique')
        $request->validate([
            'id_japem' => 'sometimes|required|string|max:255|unique:donativos,id_japem,' . $id,
            'nombre' => 'sometimes|required|string|max:255',
        ]);

        // 2. Preparar datos
        $data = $request->all();

        // 3. Convertir booleanos solo si vienen en la petición
        if($request->has('certificacion')) 
            $data['certificacion'] = $request->boolean('certificacion');
        if($request->has('candidato')) 
            $data['candidato'] = $request->boolean('candidato');
        if($request->has('donataria_aut')) 
            $data['donataria_aut'] = $request->boolean('donataria_aut');
        if($request->has('padron_ben')) 
            $data['padron_ben'] = $request->boolean('padron_ben');

        // 4. Actualizar
        $donativo->update($data);

        return response()->json([
            'message' => 'Donativo actualizado correctamente',
            'data' => $donativo
        ]);
    }
}