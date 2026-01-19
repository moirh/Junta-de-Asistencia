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
       Schema::create('donativos', function (Blueprint $table) {
        $table->id();
        // Relación con el directorio
        $table->foreignId('donante_id')->constrained('donantes')->onDelete('cascade');
        $table->date('fecha_donativo');
        $table->decimal('monto_total_deducible', 15, 2)->default(0);
        $table->text('observaciones')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donativos');
    }
};
