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
use App\Http\Controllers\DashboardController;

// --- Rutas Públicas ---
Route::post('/login', [AuthController::class, 'login']);

// --- Rutas Protegidas ---
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // ... (Dashboard, Donantes, Donativos, Inventario, Iaps igual que antes) ...
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::apiResource('donantes', DonanteController::class);
    Route::apiResource('donativos', DonativoController::class);
    Route::get('/inventario', [InventarioController::class, 'index']);
    Route::get('/inventario/{id}/detalles', [InventarioController::class, 'detalles']);
    Route::put('/inventario/precios', [InventarioController::class, 'updatePrices']);
    Route::get('iaps/sugerencias', [IapController::class, 'sugerirIaps']);
    Route::apiResource('iaps', IapController::class);
    Route::post('/iaps/importar', [IapController::class, 'importar']);

    // ==========================================
    // 4. MÓDULO DE ENTREGAS (CORREGIDO)
    // ==========================================
    Route::get('/entregas/sugerencias/{inventarioId}', [EntregaController::class, 'sugerirAsignacion']);

    // CAMBIO IMPORTANTE: Renombramos la ruta a 'procesar' para coincidir con el frontend
    Route::post('/entregas/procesar', [EntregaController::class, 'procesarEntrega']);

    // Esta es la ruta que usará tu tabla principal ahora
    Route::get('/entregas/historial', [EntregaController::class, 'historial']);

    Route::get('/entregas/pendientes', [EntregaController::class, 'pendientes']);
    Route::apiResource('entregas', EntregaController::class);

    // ... (Resto de rutas igual: Distribucion, Configuración, etc.) ...
    Route::post('/distribucion', [DistribucionController::class, 'store']);
    Route::get('/distribucion/historial', [EntregaController::class, 'pendientes']);

    Route::get('/users', [SettingsController::class, 'getUsers']);
    Route::post('/users', [SettingsController::class, 'createUser']);
    Route::put('/users/{id}', [SettingsController::class, 'updateUser']);
    Route::delete('/users/{id}', [SettingsController::class, 'deleteUser']);

    Route::get('/profile', [SettingsController::class, 'getProfile']);
    Route::put('/profile/update', [SettingsController::class, 'updateProfile']);
    Route::put('/profile/password', [SettingsController::class, 'changePassword']);

    Route::apiResource('acuerdos', AcuerdoController::class);
    Route::apiResource('recordatorios', RecordatorioController::class);
});
