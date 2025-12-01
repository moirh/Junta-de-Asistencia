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
        // Verificamos si la tabla catalogo YA existe para evitar el error
        if (!Schema::hasTable('catalogo')) {
            Schema::create('catalogo', function (Blueprint $table) {
                $table->id('id_catalogo'); // Tu PK personalizada
                $table->string('articulo', 100);
                
                // Relación con donativos
                $table->foreignId('id_donativos')
                      ->nullable()
                      ->constrained('donativos')
                      ->onUpdate('cascade')
                      ->onDelete('cascade');

                // Relación con donantes
                // IMPORTANTE: Asumimos que la PK de donantes es 'id_donantes'
                $table->foreignId('id_donantes')
                      ->nullable()
                      ->constrained('donantes', 'id_donantes') 
                      ->onUpdate('cascade')
                      ->onDelete('cascade');

                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo');
    }
};