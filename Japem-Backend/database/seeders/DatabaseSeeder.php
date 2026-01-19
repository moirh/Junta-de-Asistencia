<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Acuerdo;
use App\Models\Recordatorio;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // OPCIÓN 1: Comentar la creación del usuario (porque ya existe)
        /*
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        */

        // OPCIÓN 2 (Recomendada): Usar firstOrCreate. 
        // Esto dice: "Busca un usuario con este email. Si no existe, créalo. Si existe, no hagas nada."
        User::firstOrCreate(
            ['email' => 'test@example.com'], 
            [
                'name' => 'Test User',
                'password' => bcrypt('password'), // Contraseña por defecto
            ]
        );

        // --- Acuerdos ---
        Acuerdo::create([
            'title' => 'Reunión de Consejo',
            'description' => 'Revisión de presupuestos anuales 2025',
            'date' => '2025-11-30'
        ]);
        
        Acuerdo::create([
            'title' => 'Entrega de Reportes',
            'description' => 'Enviar informe de actividades mensuales',
            'date' => '2025-12-05'
        ]);
    
        // --- Recordatorios ---
        Recordatorio::create([
            'title' => 'Pagar servicios',
            'date' => '2025-11-28',
            'done' => false
        ]);
    
        Recordatorio::create([
            'title' => 'Llamar a proveedores',
            'date' => '2025-12-01',
            'done' => true
        ]);

    }
}