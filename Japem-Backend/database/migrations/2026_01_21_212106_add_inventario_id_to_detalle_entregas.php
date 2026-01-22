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
        Schema::table('detalle_entregas', function (Blueprint $table) {
            // Agregamos la columna que falta
            $table->unsignedBigInteger('inventario_id')->nullable(); 
            
            // Opcional: Si quieres que sea llave foránea (recomendado)
            // $table->foreign('inventario_id')->references('id')->on('inventarios');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_entregas', function (Blueprint $table) {
            $table->dropColumn('inventario_id');
        });
    }
};
