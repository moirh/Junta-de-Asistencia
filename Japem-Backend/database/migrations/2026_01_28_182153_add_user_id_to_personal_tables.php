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
        Schema::table('recordatorios', function (Blueprint $table) {
            // Creamos la relación con la tabla users
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
        });

        Schema::table('acuerdos', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('recordatorios', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
        // ... lo mismo para acuerdos
    }
};
