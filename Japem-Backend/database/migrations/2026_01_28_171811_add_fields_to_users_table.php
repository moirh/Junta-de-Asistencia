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
        Schema::table('users', function (Blueprint $table) {
            // 1. Username: Único y obligatorio
            $table->string('username')->unique()->after('name');

            // 2. Rol: Por defecto 'editor'
            $table->enum('role', ['superadmin', 'admin', 'editor', 'lector'])->default('editor')->after('username');

        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role']);
            // $table->string('email')->nullable(false)->change(); // Revertir si es necesario
        });
    }
};
