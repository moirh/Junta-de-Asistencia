<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleEntrega extends Model
{
    use HasFactory;

    // Asegúrate de que coincida con tu migración
    protected $table = 'detalle_entregas'; 

    protected $fillable = [
        'entrega_id',
        'inventario_id',
        'cantidad',
    ];

    // Relación inversa con la Entrega
    public function entrega()
    {
        return $this->belongsTo(Entrega::class);
    }

    // Relación con el Inventario (para saber nombre, unidad, etc.)
    public function producto()
    {
        return $this->belongsTo(Inventario::class, 'inventario_id');
    }
}