<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleAsignacion extends Model
{
    use HasFactory;

    protected $table = 'detalle_asignaciones';

    protected $fillable = [
        'asignacion_id',
        'inventario_id',
        'cantidad',
        'estatus'
    ];

    /**
     * Relación inversa con la Asignación Padre
     */
    public function asignacion()
    {
        return $this->belongsTo(Asignacion::class, 'asignacion_id');
    }

    /**
     * Relación con el Inventario
     * IMPORTANTE: El controlador llama a 'inventario', así que esta función debe existir.
     */
    public function inventario()
    {
        return $this->belongsTo(Inventario::class, 'inventario_id');
    }
}
