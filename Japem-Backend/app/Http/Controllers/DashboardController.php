<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Recordatorio;
use App\Models\Acuerdo;
use App\Models\Donativo;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // 1. Obtener MIS recordatorios (Aquí sigue igual, son personales)
        $misRecordatorios = Recordatorio::where('user_id', $userId)
            ->orderBy('date', 'asc')
            ->get();

        // 2. Obtener MIS acuerdos + LOS COMPARTIDOS
        // --- AQUÍ ESTABA EL DETALLE ---
        $misAcuerdos = Acuerdo::where('user_id', $userId) // Opción A: Soy el dueño
            ->orWhereHas('compartidos', function ($q) use ($userId) {
                $q->where('user_id', $userId); // Opción B: Estoy en la lista de compartidos
            })
            ->orderBy('date', 'asc')
            ->get();

        // 3. Obtener Donativos
        try {
            $totalDonativos = Donativo::whereMonth('created_at', now()->month)->count();
        } catch (\Exception $e) {
            $totalDonativos = 0;
        }

        return response()->json([
            'recordatorios' => $misRecordatorios,
            'acuerdos' => $misAcuerdos,
            'donativos' => [
                'total_mes' => $totalDonativos,
                'ultimos' => []
            ]
        ]);
    }
}
