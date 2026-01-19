<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Inventario; // <--- ¡ASEGÚRATE DE TENER ESTA LÍNEA!

class Donativo extends Model
{
    use HasFactory;

    protected $table = 'donativos';

    protected $fillable = [
        'donante_id',
        'fecha_donativo',
        'monto_total_deducible',
        'observaciones',
    ];

    protected $casts = [
        'fecha_donativo' => 'date',
        'monto_total_deducible' => 'decimal:2',
    ];

    public function donante()
    {
        return $this->belongsTo(Donante::class, 'donante_id');
    }

    // Esta función conecta con tu tabla 'inventarios'
    public function detalles()
    {
        return $this->hasMany(Inventario::class, 'donativo_id');
    }
}