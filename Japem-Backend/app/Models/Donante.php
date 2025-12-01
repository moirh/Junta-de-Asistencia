<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donante extends Model
{
    use HasFactory;

    protected $table = 'donantes';
    protected $primaryKey = 'id_donantes'; // PK personalizada

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'fecha',
        'no_oficio',
        'donante',
        'municipio',
        'descripcion',
        'costo_total',
        'nota',
    ];

    /*
     * ============================
     * MUTATORS — MAYÚSCULAS
     * ============================
     */
    public function setNoOficioAttribute($value) { $this->attributes['no_oficio'] = mb_strtoupper($value, 'UTF-8'); }
    public function setDonanteAttribute($value) { $this->attributes['donante'] = mb_strtoupper($value, 'UTF-8'); }
    public function setMunicipioAttribute($value) { $this->attributes['municipio'] = mb_strtoupper($value, 'UTF-8'); }
    public function setDescripcionAttribute($value) { $this->attributes['descripcion'] = mb_strtoupper($value, 'UTF-8'); }
    public function setNotaAttribute($value) { $this->attributes['nota'] = mb_strtoupper($value, 'UTF-8'); }

    // RELACIÓN
    // Un donante puede tener muchos artículos en el catálogo
    public function catalogo()
    {
        return $this->hasMany(Catalogo::class, 'id_donantes', 'id_donantes');
    }
}