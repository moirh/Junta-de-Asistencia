<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Acuerdo;
use App\Models\Recordatorio;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; 

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // USUARIO ADMINISTRADOR PRINCIPAL
        // Usamos firstOrCreate para evitar duplicados
        User::firstOrCreate(
            ['email' => 'admin@japem.gob.mx'], 
            [
                'name' => 'Administrador JAPEM',
                'username' => 'admin.japem',  
                'password' => Hash::make('password'), 
                'role' => 'admin',            
            ]
        );

        User::firstOrCreate(
            ['email' => 'moises.japem@japem.gob.mx'], 
            [
                'name' => 'Moises Ruiz',
                'username' => 'moises.japem',  
                'password' => Hash::make('123456'), 
                'role' => 'admin',            
            ]
        );

        User::firstOrCreate(
            ['email' => 'operador@japem.gob.mx'], 
            [
                'name' => 'Operador SIACE',
                'username' => 'operador.siace', 
                'password' => Hash::make('password'),
                'role' => 'editor', 
            ]
        );

    }
}