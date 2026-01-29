<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonanteController;
use App\Http\Controllers\DonativoController;
use App\Http\Controllers\AcuerdoController;
use App\Http\Controllers\RecordatorioController;
use App\Http\Controllers\IapController;
use App\Http\Controllers\EntregaController;
use App\Http\Controllers\DistribucionController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DashboardController; // <--- 1. IMPORTANTE: AGREGAR ESTO

// --- Rutas Públicas ---
Route::post('/login', [AuthController::class, 'login']);

// --- Rutas Protegidas (Requieren Token) ---
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // ==========================================
    // 0. DASHBOARD (INICIO)
    // ==========================================
    // Esta es la ruta que te faltaba:
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ==========================================
    // 1. MÓDULO DE DONANTES
    // ==========================================
    Route::apiResource('donantes', DonanteController::class);

    // ==========================================
    // 2. MÓDULO DE DONATIVOS
    // ==========================================
    Route::apiResource('donativos', DonativoController::class);

    // Inventario
    Route::get('/inventario', [InventarioController::class, 'index']);
    Route::get('/inventario/{id}/detalles', [InventarioController::class, 'detalles']);

    // ==========================================
    // 3. MÓDULO DE IAPs
    // ==========================================
    Route::get('iaps/sugerencias', [IapController::class, 'sugerirIaps']);
    Route::apiResource('iaps', IapController::class);

    // ==========================================
    // 4. MÓDULO DE ENTREGAS
    // ==========================================
    Route::get('/entregas/sugerencias/{inventarioId}', [EntregaController::class, 'sugerirAsignacion']);
    Route::post('/entregas/confirmar', [EntregaController::class, 'procesarEntrega']);
    Route::get('/entregas/historial', [EntregaController::class, 'historial']);
    Route::get('/entregas/pendientes', [EntregaController::class, 'pendientes']);
    Route::apiResource('entregas', EntregaController::class);

    // ==========================================
    // 5. DISTRIBUCIÓN
    // ==========================================
    Route::post('/distribucion', [DistribucionController::class, 'store']);
    Route::get('/distribucion/historial', [EntregaController::class, 'pendientes']);

    // ==========================================
    // 6. CONFIGURACIÓN
    // ==========================================
    Route::get('/users', [SettingsController::class, 'getUsers']);
    Route::post('/users', [SettingsController::class, 'createUser']);
    Route::put('/users/{id}', [SettingsController::class, 'updateUser']);
    Route::delete('/users/{id}', [SettingsController::class, 'deleteUser']);

    Route::get('/profile', [SettingsController::class, 'getProfile']);
    Route::put('/profile/update', [SettingsController::class, 'updateProfile']);
    Route::put('/profile/password', [SettingsController::class, 'changePassword']);

    // ==========================================
    // OTROS MÓDULOS
    // ==========================================
    Route::apiResource('acuerdos', AcuerdoController::class);
    Route::apiResource('recordatorios', RecordatorioController::class);
});
