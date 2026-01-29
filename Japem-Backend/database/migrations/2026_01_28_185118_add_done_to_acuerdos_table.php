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
        Schema::table('acuerdos', function (Blueprint $table) {
            // Agregamos la columna 'done' (booleano) con valor por defecto 'false'
            $table->boolean('done')->default(false)->after('date');
        });
    }

    public function down()
    {
        Schema::table('acuerdos', function (Blueprint $table) {
            $table->dropColumn('done');
        });
    }
};
