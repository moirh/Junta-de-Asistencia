<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donante extends Model
{
    use HasFactory;

    protected $table = 'donantes';

    // Ahora usamos la estructura estándar 'id', no 'id_donantes'
    protected $fillable = [
        'razon_social',
        'rfc',
        'regimen_fiscal',
        'direccion',
        'cp',
        'contacto',
        'email',
        'telefono',
        'telefono_secundario',
        'estatus',
    ];

    // Mutadores para guardar siempre en mayúsculas
    public function setRazonSocialAttribute($value) { $this->attributes['razon_social'] = mb_strtoupper($value, 'UTF-8'); }
    public function setRfcAttribute($value) { $this->attributes['rfc'] = mb_strtoupper($value, 'UTF-8'); }
    public function setDireccionAttribute($value) { $this->attributes['direccion'] = mb_strtoupper($value, 'UTF-8'); }
    public function setContactoAttribute($value) { $this->attributes['contacto'] = mb_strtoupper($value, 'UTF-8'); }

    public function donativos()
    {
        return $this->hasMany(Donativo::class, 'donante_id');
    }
}