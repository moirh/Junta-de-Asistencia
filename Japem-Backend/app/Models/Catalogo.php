<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalogo extends Model
{
    use HasFactory;

    protected $table = 'catalogo';
    protected $primaryKey = 'id_catalogo';

    public $timestamps = false;

    protected $fillable = [
        'articulo',
        'id_donativos',
        'id_donantes',
    ];

    public function donativo()
    {
        return $this->belongsTo(Donativo::class, 'id_donativos');
    }

    public function donante()
    {
        return $this->belongsTo(Donante::class, 'id_donantes', 'id_donantes');
    }
}