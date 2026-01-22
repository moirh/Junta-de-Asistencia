<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla Principal de Asignaciones (El "Header" de la distribución)
        Schema::create('asignaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('iap_id')->constrained('iaps')->onDelete('cascade');
            $table->enum('estatus', ['pendiente', 'entregado'])->default('pendiente');
            $table->timestamps();
        });

        // 2. Tabla de Detalles (Qué productos se asignaron)
        Schema::create('detalle_asignaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asignacion_id')->constrained('asignaciones')->onDelete('cascade');
            $table->foreignId('inventario_id')->constrained('inventarios'); // El producto real
            $table->integer('cantidad');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_asignaciones');
        Schema::dropIfExists('asignaciones');
    }
};