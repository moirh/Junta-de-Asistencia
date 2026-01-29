<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. CAMBIO IMPORTANTE: Validamos 'username' en lugar de 'email'
        $request->validate([
            'username' => 'required|string', // Antes decía 'email' => 'required|email'
            'password' => 'required|string',
        ]);

        // 2. Intentamos loguear buscando en la columna 'username'
        if (!Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
            return response()->json([
                'message' => 'Credenciales incorrectas. Verifique usuario y contraseña.'
            ], 401);
        }

        // 3. Generamos el token si las credenciales son correctas
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        // Borramos tokens anteriores para no acumular basura (opcional pero recomendado)
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        // Revocamos el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}