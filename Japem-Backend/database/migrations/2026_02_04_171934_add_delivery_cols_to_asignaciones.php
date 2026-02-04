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
        Schema::table('asignaciones', function (Blueprint $table) {
            // Agregamos las columnas que el controlador está buscando y no encuentra
            $table->dateTime('fecha_asignacion')->nullable()->after('iap_id');
            $table->string('responsable_entrega')->nullable()->after('estatus');
            $table->string('lugar_entrega')->nullable()->after('responsable_entrega');
            $table->dateTime('fecha_entrega_real')->nullable()->after('lugar_entrega');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asignaciones', function (Blueprint $table) {
            //
        });
    }
};
