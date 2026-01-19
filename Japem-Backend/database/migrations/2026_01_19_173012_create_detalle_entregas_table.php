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
        Schema::create('detalle_entregas', function (Blueprint $table) {
        $table->id();
        $table->foreignId('entrega_id')->constrained('entregas')->onDelete('cascade');
        $table->string('nombre_producto'); // Debe coincidir con lo que entró
        $table->integer('cantidad_entregada'); // SALIDA DE INVENTARIO
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_entregas');
    }
};
