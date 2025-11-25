<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregamos esta verificación
        if (!Schema::hasTable('recordatorios')) {
            Schema::create('recordatorios', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->date('date');
                // El booleano por defecto en false para que inicie como "no hecho"
                $table->boolean('done')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recordatorios');
    }
};