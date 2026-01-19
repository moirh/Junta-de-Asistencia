<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleEntrega extends Model
{
    use HasFactory;

    protected $fillable = [
        'entrega_id',
        'nombre_producto',
        'cantidad_entregada',
    ];

    public function entrega()
    {
        return $this->belongsTo(Entrega::class, 'entrega_id');
    }
    
    // Al guardar una salida, nos aseguramos que el nombre coincida mayúsculas/minúsculas con la entrada
    public function setNombreProductoAttribute($value)
    {
        $this->attributes['nombre_producto'] = mb_strtoupper($value, 'UTF-8');
    }
}