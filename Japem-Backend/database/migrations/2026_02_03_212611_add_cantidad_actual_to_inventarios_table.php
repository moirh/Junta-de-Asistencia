<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('inventarios', function (Blueprint $table) {
            // Agregamos la columna para el stock vivo
            $table->decimal('cantidad_actual', 10, 2)->after('cantidad')->default(0);
        });

        // IMPORTANTE: Igualamos la cantidad actual a la original para los datos que ya existen
        DB::statement('UPDATE inventarios SET cantidad_actual = cantidad');
    }

    public function down()
    {
        Schema::table('inventarios', function (Blueprint $table) {
            $table->dropColumn('cantidad_actual');
        });
    }
};
