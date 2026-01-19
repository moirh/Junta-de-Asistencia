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
            // Agregamos la columna después del nombre del producto
            $table->string('clave_sat')->nullable()->after('nombre_producto');
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
