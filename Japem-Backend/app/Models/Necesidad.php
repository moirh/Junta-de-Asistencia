<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Necesidad extends Model
{
    use HasFactory;

    protected $table = 'necesidades';
    protected $primaryKey = 'id_necesidad';

    // AGREGA ESTA LÍNEA PARA SOLUCIONAR EL ERROR:
    public $timestamps = false; 

    protected $fillable = [
        'id_donativos',
        'necesidad_pri',
        'necesidad_sec',
        'necesidad_com',
    ];

    public function donativo()
    {
        return $this->belongsTo(Donativo::class, 'id_donativos');
    }
}