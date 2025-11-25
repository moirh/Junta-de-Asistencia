<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonativoController;
use App\Http\Controllers\DonanteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AcuerdoController;
use App\Http\Controllers\RecordatorioController;

// --- Rutas Públicas ---
Route::post('/login', [AuthController::class, 'login']);

// --- Rutas Protegidas (Requieren Token) ---
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rutas de Donativos y Donantes
    Route::apiResource('donativos', DonativoController::class);
    Route::apiResource('donantes', DonanteController::class);

    Route::apiResource('acuerdos', AcuerdoController::class);
    Route::apiResource('recordatorios', RecordatorioController::class);
});