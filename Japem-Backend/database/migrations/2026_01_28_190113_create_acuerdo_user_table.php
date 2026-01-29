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
        Schema::create('acuerdo_user', function (Blueprint $table) {
            $table->id();
            // Relación con el acuerdo
            $table->foreignId('acuerdo_id')->constrained()->onDelete('cascade');
            // Relación con el usuario con quien se comparte
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('acuerdo_user');
    }
};
