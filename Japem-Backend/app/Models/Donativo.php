<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donativo extends Model
{
    use HasFactory;

    protected $table = 'donativos';

    protected $fillable = [
        'id_japem',
        'nombre',
        'estatus',
        'rubro',
        'act_asistencial',
        'poblacion',
        // 'necesidad_*' ELIMINADOS, ya no están en esta tabla
        'certificacion',
        'candidato',
        'donataria_aut',
        'padron_ben',
        'veces_don',
    ];

    // Relación 1 a 1 con Necesidades
    public function necesidad()
    {
        return $this->hasOne(Necesidad::class, 'id_donativos');
    }

    // Relación 1 a Muchos con Catalogo
    public function catalogo()
    {
        return $this->hasMany(Catalogo::class, 'id_donativos');
    }
}