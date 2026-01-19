<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    use HasFactory;

    // IMPORTANTE: Definimos explícitamente el nombre de tu tabla
    protected $table = 'inventarios';

    protected $fillable = [
        'donativo_id',
        'categoria_producto',
        'nombre_producto',
        'clave_sat',
        'modalidad',
        'clave_unidad',
        'cantidad',
        'precio_venta_unitario',
        'precio_venta_total',
        'precio_unitario_deducible',
        'monto_deducible_total',
    ];

    public function donativo()
    {
        return $this->belongsTo(Donativo::class, 'donativo_id');
    }
}