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

// --- Rutas Públicas ---
Route::post('/login', [AuthController::class, 'login']);

// --- Rutas Protegidas (Requieren Token) ---
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // ==========================================
    // 1. MÓDULO DE DONANTES (DIRECTORIO)
    // ==========================================
    Route::apiResource('donantes', DonanteController::class);

    // ==========================================
    // 2. MÓDULO DE DONATIVOS (ENTRADAS)
    // ==========================================
    Route::apiResource('donativos', DonativoController::class);

    // Inventario General (Resumido)
    Route::get('/inventario', [InventarioController::class, 'index']);

    // Detalles de un producto específico (Lotes)
    Route::get('/inventario/{id}/detalles', [InventarioController::class, 'detalles']);

    // ==========================================
    // 3. MÓDULO DE IAPs (BENEFICIARIOS)
    // ==========================================
    Route::get('iaps/sugerencias', [IapController::class, 'sugerirIaps']);
    Route::apiResource('iaps', IapController::class);

    // ==========================================
    // 4. MÓDULO DE ENTREGAS (SALIDAS Y CONTROL)
    // ==========================================

    // ✅ NUEVA RUTA: Sugerencias Inteligentes (Clasificación A, B, C...)
    Route::get('/entregas/sugerencias/{inventarioId}', [EntregaController::class, 'sugerirAsignacion']);

    // Ruta para procesar la entrega desde el Modal
    Route::post('/entregas/confirmar', [EntregaController::class, 'procesarEntrega']);

    // Rutas de consulta específicas
    Route::get('/entregas/historial', [EntregaController::class, 'historial']); // Lo ya entregado
    Route::get('/entregas/pendientes', [EntregaController::class, 'pendientes']); // Lo pendiente por entregar

    // API Resource estándar
    Route::apiResource('entregas', EntregaController::class);

    // ==========================================
    // 5. DISTRIBUCIÓN
    // ==========================================
    Route::post('/distribucion', [DistribucionController::class, 'store']);

    // Ruta para compatibilidad con versiones anteriores del frontend
    Route::get('/distribucion/historial', [EntregaController::class, 'pendientes']);

    // ==========================================
    // OTROS MÓDULOS
    // ==========================================
    Route::apiResource('acuerdos', AcuerdoController::class);
    Route::apiResource('recordatorios', RecordatorioController::class);
});