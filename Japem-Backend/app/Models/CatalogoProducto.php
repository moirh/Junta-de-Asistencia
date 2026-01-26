<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoProducto extends Model
{
    use HasFactory;

    protected $table = 'catalogo_productos';

    protected $fillable = [
        'nombre',
        'categoria',
        'clave_sat',
        'unidad_medida',
        'precio_referencia'
    ];

    // Relación: Un producto del catálogo tiene muchos lotes en inventario
    public function inventarios()
    {
        return $this->hasMany(Inventario::class, 'catalogo_producto_id');
    }
}