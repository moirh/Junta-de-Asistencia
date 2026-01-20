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
        Schema::table('inventarios', function (Blueprint $table) {
            // Estado por defecto 'Nuevo'
            $table->string('estado', 50)->default('Nuevo')->after('nombre_producto');
            // Fecha de caducidad opcional
            $table->date('fecha_caducidad')->nullable()->after('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventarios', function (Blueprint $table) {
            //
        });
    }
};
