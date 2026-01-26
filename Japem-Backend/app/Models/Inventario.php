<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Inventario extends Model
{
    use HasFactory;

    protected $table = 'inventarios';

    protected $fillable = [
        'donativo_id',
        'catalogo_producto_id',
        'nombre_producto',
        'cantidad',
        'estado',
        'modalidad',
        'fecha_caducidad',
        'clave_unidad',
        'clave_sat',
        'categoria_producto',
        'precio_unitario_deducible',
        'monto_deducible_total',
        'precio_venta_unitario',
        'precio_venta_total'
    ];
    protected $appends = ['dias_en_almacen', 'semaforo_rotacion'];

    // 1. RELACIÓN: El inventario pertenece a un Donativo
    public function donativo()
    {
        return $this->belongsTo(Donativo::class, 'donativo_id');
    }

    // 2. CÁLCULO INTELIGENTE: Usamos la fecha del donativo si existe
    public function getDiasEnAlmacenAttribute()
    {
        // Por defecto usamos la fecha de creación del registro
        $fechaIngreso = $this->created_at;

        // PERO, si existe un donativo padre, usamos SU fecha (la del formulario)
        if ($this->donativo) {
            $fechaIngreso = Carbon::parse($this->donativo->fecha_donativo);
        }

        // Calculamos la diferencia en días con HOY
        return $fechaIngreso->diffInDays(now());
    }

    // 3. SEMÁFORO (Se mantiene igual, pero ahora el cálculo de $dias es más exacto)
    public function getSemaforoRotacionAttribute()
    {
        $dias = $this->dias_en_almacen;

        if ($dias >= 25) {
            return 'critico'; // Rojo
        } elseif ($dias >= 15) {
            return 'atencion'; // Amarillo
        } else {
            return 'fresco'; // Verde
        }
    }
}
