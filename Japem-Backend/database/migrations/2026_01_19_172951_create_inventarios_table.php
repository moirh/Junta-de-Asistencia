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
    Schema::create('inventarios', function (Blueprint $table) {
        $table->id();
        $table->foreignId('donativo_id')->constrained('donativos')->onDelete('cascade');
        
        $table->string('categoria_producto'); // "Nombre (categoría)"
        $table->string('nombre_producto'); // "Productos especificados"
        $table->string('modalidad')->nullable();
        $table->string('clave_unidad')->nullable();
        
        // Inventario y Costos
        $table->integer('cantidad'); // ENTRADA DE INVENTARIO
        $table->decimal('precio_venta_unitario', 10, 2)->default(0);
        $table->decimal('precio_venta_total', 15, 2)->default(0);
        $table->decimal('precio_unitario_deducible', 10, 2)->default(0);
        $table->decimal('monto_deducible_total', 15, 2)->default(0);
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventarios');
    }
};
