<?php

namespace App\Models;

// 1. Importaciones necesarias
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <--- ¡ESTA ES LA CLAVE!

class User extends Authenticatable
{
    // 2. Usar los Traits dentro de la clase
    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'username', // <--- AGREGADO
        'email',
        'password',
        'role',     // <--- AGREGADO
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
