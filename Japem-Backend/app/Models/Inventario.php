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
        'cantidad',         // Se queda fija (lo que entró originalmente)
        'cantidad_actual',  // NUEVO: Se actualizará con las entregas (Stock real)
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
        $fechaIngreso = $this->created_at;

        if ($this->donativo) {
            $fechaIngreso = Carbon::parse($this->donativo->fecha_donativo);
        }

        return $fechaIngreso->diffInDays(now());
    }

    // 3. SEMÁFORO
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