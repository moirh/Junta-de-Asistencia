<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recordatorio extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 
        'date', 
        'done', 
        'user_id' // <--- ¡IMPORTANTE! Agregar esto
    ];

    protected $casts = [
        'done' => 'boolean',
        'date' => 'date'
    ];

    // Relación con el usuario (Opcional pero útil)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}