<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
// Controladores Existentes
use App\Http\Controllers\DonanteController;
use App\Http\Controllers\DonativoController;
use App\Http\Controllers\AcuerdoController;
use App\Http\Controllers\RecordatorioController;
use App\Http\Controllers\CatalogoController;
// Nuevos Controladores (Importantes para la reestructuración)
use App\Http\Controllers\IapController;        // Maneja IAPs y el Algoritmo de Match
use App\Http\Controllers\EntregaController;    // Maneja las Salidas
use App\Http\Controllers\InventarioController; // Maneja el cálculo de stock

// --- Rutas Públicas ---
Route::post('/login', [AuthController::class, 'login']);

// --- Rutas Protegidas (Requieren Token) ---
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);

    // ==========================================
    // 1. MÓDULO DE DONANTES (DIRECTORIO)
    // ==========================================
    // Guarda: Razón social, RFC, Dirección, Estatus, etc.
    Route::apiResource('donantes', DonanteController::class);

    // ==========================================
    // 2. MÓDULO DE DONATIVOS (ENTRADAS)
    // ==========================================
    // Guarda: Fecha, Referencia al Donante y Productos (Detalles)
    Route::apiResource('donativos', DonativoController::class);

    // ==========================================
    // 3. MÓDULO DE IAPs (BENEFICIARIOS Y MATCH)
    // ==========================================
    // Ruta personalizada para el ALGORITMO:
    // Se coloca ANTES del apiResource para evitar conflictos de ID.
    // Ejemplo de uso: GET /api/iaps/sugerencias?producto=Arroz
    Route::get('iaps/sugerencias', [IapController::class, 'sugerirIaps']);
    
    // CRUD normal de IAPs (Crear, Editar, Borrar instituciones)
    Route::apiResource('iaps', IapController::class);

    // ==========================================
    // 4. MÓDULO DE ENTREGAS (SALIDAS)
    // ==========================================
    // Registra la salida de productos hacia una IAP
    Route::apiResource('entregas', EntregaController::class);

    // ==========================================
    // 5. MÓDULO DE INVENTARIO
    // ==========================================
    // Solo lectura: Calcula Entradas - Salidas
    Route::get('inventario', [InventarioController::class, 'index']);

    // ==========================================
    // OTROS MÓDULOS (TU CÓDIGO EXISTENTE)
    // ==========================================
    Route::apiResource('acuerdos', AcuerdoController::class);
    Route::apiResource('recordatorios', RecordatorioController::class);
    
});