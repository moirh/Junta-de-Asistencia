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
       Schema::create('iaps', function (Blueprint $table) {
        $table->id();
        $table->string('nombre_iap');
        $table->string('estatus')->default('Activo'); // Activo, Inactivo
        $table->string('rubro')->nullable();
        $table->text('actividad_asistencial')->nullable();
        $table->integer('personas_beneficiadas')->default(0);
        
        // Datos para el algoritmo de emparejamiento
        $table->string('necesidad_primaria')->nullable();
        $table->string('necesidad_complementaria')->nullable();
        
        // Booleans de validación
        $table->boolean('es_certificada')->default(false);
        $table->boolean('tiene_donataria_autorizada')->default(false);
        $table->boolean('tiene_padron_beneficiarios')->default(false);
        
        $table->integer('veces_donado')->default(0); // Contador histórico
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iaps');
    }
};
