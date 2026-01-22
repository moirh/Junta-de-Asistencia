<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleAsignacion extends Model
{
    use HasFactory;

    protected $table = 'detalle_asignaciones';

    protected $fillable = ['asignacion_id', 'inventario_id', 'cantidad'];

    // Relación con el producto del inventario
    public function producto()
    {
        return $this->belongsTo(Inventario::class, 'inventario_id');
    }
}