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
        Schema::table('iaps', function (Blueprint $table) {

            // 1. Actividad y Clasificación
            if (!Schema::hasColumn('iaps', 'actividad_asistencial')) {
                $table->string('actividad_asistencial')->nullable();
            }
            if (!Schema::hasColumn('iaps', 'clasificacion')) {
                $table->string('clasificacion')->nullable();
            }

            // 2. Beneficiarios
            if (!Schema::hasColumn('iaps', 'tipo_beneficiario')) {
                $table->string('tipo_beneficiario')->nullable();
            }
            if (!Schema::hasColumn('iaps', 'personas_beneficiadas')) {
                $table->integer('personas_beneficiadas')->default(0);
            }

            // 3. Necesidades
            if (!Schema::hasColumn('iaps', 'necesidad_primaria')) {
                $table->string('necesidad_primaria')->nullable();
            }
            if (!Schema::hasColumn('iaps', 'necesidad_complementaria')) {
                $table->string('necesidad_complementaria')->nullable();
            }

            // 4. Validaciones (Booleans)
            if (!Schema::hasColumn('iaps', 'es_certificada')) {
                $table->boolean('es_certificada')->default(false);
            }
            if (!Schema::hasColumn('iaps', 'tiene_donataria_autorizada')) {
                $table->boolean('tiene_donataria_autorizada')->default(false);
            }
            if (!Schema::hasColumn('iaps', 'tiene_padron_beneficiarios')) {
                $table->boolean('tiene_padron_beneficiarios')->default(false);
            }

            // 5. Historial
            if (!Schema::hasColumn('iaps', 'veces_donado')) {
                $table->integer('veces_donado')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('iaps', function (Blueprint $table) {
            $table->dropColumn('clasificacion');
        });
    }
};
