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
        
        // ✅ ASEGÚRATE QUE ESTOS 3 ESTÉN AQUÍ:
        'necesidad_pri',
        'necesidad_sec',
        'necesidad_com',
        
        'certificacion',
        'candidato',
        'donataria_aut',
        'padron_ben',
        'veces_don',
    ];
}