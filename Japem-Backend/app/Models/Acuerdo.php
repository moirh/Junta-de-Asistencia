<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Acuerdo extends Model
{
    use HasFactory;

    // Esta línea es OBLIGATORIA para usar Acuerdo::create()
    protected $fillable = [
        'title', 
        'description', 
        'date'
    ];
}