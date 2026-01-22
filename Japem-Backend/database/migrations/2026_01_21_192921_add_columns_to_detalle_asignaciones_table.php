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
        Schema::table('detalle_asignaciones', function (Blueprint $table) {
            // Agregamos las columnas que le faltan a tu tabla real para que funcione con tu código
            $table->unsignedBigInteger('iap_id')->nullable(); // Para saber quién recibió
            $table->string('producto_nombre')->nullable();    // Para guardar el nombre histórico

            // Hacemos que asignacion_id sea nullable por si no lo estás usando todavía
            $table->unsignedBigInteger('asignacion_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('detalle_asignaciones', function (Blueprint $table) {
            $table->dropColumn(['iap_id', 'producto_nombre']);
        });
    }
};
