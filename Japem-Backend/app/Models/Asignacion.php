<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asignacion extends Model
{
    use HasFactory;

    protected $table = 'asignaciones'; // Nombre explícito de la tabla

    protected $fillable = ['iap_id', 'estatus'];

    // Relación con la IAP
    public function iap()
    {
        return $this->belongsTo(Iap::class, 'iap_id');
    }

    // Relación con los detalles
    public function detalles()
    {
        return $this->hasMany(DetalleAsignacion::class, 'asignacion_id');
    }
}