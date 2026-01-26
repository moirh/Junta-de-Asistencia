<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Tabla de Catálogo (Datos Maestros / Fijos)
        Schema::create('catalogo_productos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique(); // El nombre no se puede repetir (ARROZ)
            $table->string('categoria')->nullable();
            $table->string('clave_sat')->nullable()->default('01010101');
            $table->string('unidad_medida')->nullable();
            $table->decimal('precio_referencia', 10, 2)->default(0); // Precio sugerido
            $table->timestamps();
        });

        // 2. Actualizamos la tabla Inventarios para vincularla (Si ya existe)
        // Si tu tabla inventarios ya tiene datos, esto agrega la columna catalogo_producto_id
        if (Schema::hasTable('inventarios')) {
            Schema::table('inventarios', function (Blueprint $table) {
                // Agregamos la llave foránea nullable por si hay datos viejos
                $table->foreignId('catalogo_producto_id')->nullable()->constrained('catalogo_productos')->onDelete('cascade');
                
                // Asegúrate de tener estos campos que pediste en inventarios:
                // $table->string('estado')->default('Nuevo'); // Nuevo, Usado, Buen Estado
                // $table->string('modalidad')->nullable(); // Compra, Donativo
                // $table->decimal('precio_unitario', 10, 2)->default(0);
                // $table->decimal('precio_total', 10, 2)->default(0);
            });
        }
    }

    public function down()
    {
        Schema::table('inventarios', function (Blueprint $table) {
            $table->dropForeign(['catalogo_producto_id']);
            $table->dropColumn('catalogo_producto_id');
        });
        Schema::dropIfExists('catalogo_productos');
    }
};