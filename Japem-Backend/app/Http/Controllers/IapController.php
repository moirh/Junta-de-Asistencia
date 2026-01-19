<?php

namespace App\Http\Controllers;

use App\Models\Iap;
use Illuminate\Http\Request;

class IapController extends Controller
{
    public function index()
    {
        return Iap::orderBy('nombre_iap', 'asc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_iap' => 'required|string|max:255',
            'rubro' => 'nullable|string',
        ]);

        $iap = Iap::create($request->all());
        return response()->json($iap, 201);
    }

    public function show($id)
    {
        return Iap::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $iap = Iap::findOrFail($id);
        $iap->update($request->all());
        return response()->json($iap);
    }

    public function destroy($id)
    {
        $iap = Iap::findOrFail($id);
        $iap->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }

    // --- ESTA ES LA FUNCIÓN QUE TE FALTABA ---
    public function sugerirIaps(Request $request)
    {
        // 1. Recibimos qué producto queremos donar
        $producto = $request->query('producto');

        if (!$producto) {
            return response()->json([]);
        }

        // 2. Buscamos IAPs activas que necesiten ese producto
        // Usamos 'ILIKE' porque estás en PostgreSQL (ignora mayúsculas)
        $candidatos = Iap::where('estatus', 'Activo')
            ->where(function($query) use ($producto) {
                $query->where('necesidad_primaria', 'ILIKE', "%$producto%")
                      ->orWhere('necesidad_complementaria', 'ILIKE', "%$producto%")
                      ->orWhere('rubro', 'ILIKE', "%$producto%");
            })
            // 3. Reglas de Prioridad
            ->orderBy('es_certificada', 'desc')
            ->orderBy('tiene_donataria_autorizada', 'desc')
            ->orderBy('veces_donado', 'asc')
            ->take(5)
            ->get();

        return response()->json($candidatos);
    }
}