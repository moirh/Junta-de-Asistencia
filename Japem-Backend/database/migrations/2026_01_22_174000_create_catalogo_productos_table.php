<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Agregamos esta validación:
        if (!Schema::hasTable('catalogo_productos')) {
            Schema::create('catalogo_productos', function (Blueprint $table) {
                $table->id();
                // ... tus columnas ...
                $table->timestamps();
            });
        }
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_productos');
    }
};
