<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iap extends Model
{
    use HasFactory;

    protected $table = 'iaps';

    protected $fillable = [
        'nombre_iap',
        'estatus',
        'rubro',
        'actividad_asistencial',
        'clasificacion',
        'tipo_beneficiario',
        'personas_beneficiadas',
        'necesidad_primaria',
        'necesidad_complementaria',
        'es_certificada',
        'tiene_donataria_autorizada',
        'tiene_padron_beneficiarios',
        'veces_donado'
    ];

    // Esto convierte automáticamente los tinyint a booleanos
    protected $casts = [
        'es_certificada' => 'boolean',
        'tiene_donataria_autorizada' => 'boolean',
        'tiene_padron_beneficiarios' => 'boolean',
        'personas_beneficiadas' => 'integer',
        'veces_donado' => 'integer',
    ];

    // Mutador para guardar nombre siempre en mayúsculas
    public function setNombreIapAttribute($value) { $this->attributes['nombre_iap'] = mb_strtoupper($value, 'UTF-8'); }
}