<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AcuerdoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(\App\Models\Acuerdo::all());
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'date' => 'required|date',
        ]);
        $acuerdo = \App\Models\Acuerdo::create($validated);
        return response()->json($acuerdo, 201);
    }
}