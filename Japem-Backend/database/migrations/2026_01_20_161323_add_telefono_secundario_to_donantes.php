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
        Schema::table('donantes', function (Blueprint $table) {
            // Lo agregamos justo después del teléfono principal
            $table->string('telefono_secundario', 20)->nullable()->after('telefono');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donantes', function (Blueprint $table) {
            //
        });
    }
};
