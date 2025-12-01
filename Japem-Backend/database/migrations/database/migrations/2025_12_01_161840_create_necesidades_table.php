<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Esta condición es la clave: evita el error si la tabla ya existe
        if (!Schema::hasTable('necesidades')) {
            Schema::create('necesidades', function (Blueprint $table) {
                $table->id('id_necesidad'); // PK correcta
                
                $table->foreignId('id_donativos')
                      ->constrained('donativos')
                      ->onUpdate('cascade')
                      ->onDelete('cascade');
                
                $table->string('necesidad_pri')->nullable();
                $table->string('necesidad_sec')->nullable();
                $table->string('necesidad_com')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('necesidades');
    }
};