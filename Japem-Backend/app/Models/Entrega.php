<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entrega extends Model
{
    use HasFactory;

    protected $fillable = [
        'iap_id',
        'fecha_entrega',
        'responsable_entrega',
        'observaciones_generales',
    ];

    protected $casts = [
        'fecha_entrega' => 'date',
    ];

    public function iap()
    {
        return $this->belongsTo(Iap::class, 'iap_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleEntrega::class, 'entrega_id');
    }
}