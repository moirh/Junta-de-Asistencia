<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Acuerdo extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'done',
        'user_id' // Este es el ID del CREADOR (Dueño)
    ];

    protected $casts = [
        'done' => 'boolean',
        'date' => 'date'
    ];

    // ==========================================
    // RELACIONES
    // ==========================================

    /**
     * 1. El Creador / Dueño del acuerdo.
     * Relación: Un acuerdo pertenece a un solo creador.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 2. Usuarios con los que se comparte.
     * Relación: Un acuerdo puede pertenecer a (ser visto por) muchos usuarios.
     * Esta función busca en la tabla pivote 'acuerdo_user'.
     */
    public function compartidos()
    {
        // 'acuerdo_user' es el nombre de la tabla intermedia que creamos en la migración
        return $this->belongsToMany(User::class, 'acuerdo_user');
    }
}
