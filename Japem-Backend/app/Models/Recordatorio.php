<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recordatorio extends Model
{
    use HasFactory;

    // Autorizamos estos campos para que se puedan guardar
    protected $fillable = [
        'title', 
        'date', 
        'done'
    ];
    
    // Opcional: Indicar que 'done' debe tratarse como booleano
    protected $casts = [
        'done' => 'boolean',
    ];
}