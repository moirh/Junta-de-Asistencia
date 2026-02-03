<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donativo extends Model
{
    use HasFactory;

    protected $table = 'donativos';

    protected $fillable = [
        'donante_id',
        'fecha_donativo',
        'monto_total_deducible',
        'observaciones',
        'evidencia_url'
    ];

    /**
     * Relación con el Donante (Quién dio)
     */
    public function donante()
    {
        return $this->belongsTo(Donante::class, 'donante_id');
    }

    /**
     * Relación con Inventarios (Qué entró)
     * ESTA ES LA FUNCIÓN QUE TE FALTABA
     */
    public function inventarios()
    {
        // Un donativo tiene muchos items de inventario asociados
        return $this->hasMany(Inventario::class, 'donativo_id');
    }
}
