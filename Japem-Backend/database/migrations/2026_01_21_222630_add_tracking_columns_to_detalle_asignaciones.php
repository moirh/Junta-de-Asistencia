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
        Schema::table('detalle_asignaciones', function (Blueprint $table) {
            // Solo las agregamos si no existen (por precaución)
            if (!Schema::hasColumn('detalle_asignaciones', 'estatus')) {
                $table->string('estatus')->default('pendiente');
            }
            if (!Schema::hasColumn('detalle_asignaciones', 'fecha_entrega')) {
                $table->timestamp('fecha_entrega')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('detalle_asignaciones', function (Blueprint $table) {
            $table->dropColumn(['estatus', 'fecha_entrega']);
        });
    }
};
