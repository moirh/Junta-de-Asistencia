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
       Schema::create('donantes', function (Blueprint $table) {
        $table->id();
        $table->string('razon_social'); // Nombre o Razón Social
        $table->string('rfc')->nullable();
        $table->string('regimen_fiscal')->nullable();
        $table->text('direccion')->nullable();
        $table->string('cp')->nullable();
        $table->string('contacto'); // Persona de contacto
        $table->string('email')->nullable();
        $table->string('telefono')->nullable();
        // Estatus: Permanente, Eventual, Única vez
        $table->enum('estatus', ['Permanente', 'Eventual', 'Unica vez'])->default('Eventual');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donantes');
    }
};
