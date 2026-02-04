<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    // --- USUARIOS ---
    public function getUsers()
    {
        return response()->json(User::orderBy('id', 'asc')->get());
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|string|min:6',
            // Asegúrate que estos roles coincidan con lo que envías desde el Frontend (admin, editor, viewer/lector)
            'role' => 'required|in:superadmin,admin,editor,lector'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role']
        ]);

        return response()->json($user, 201);
    }

    // ==========================================
    // NUEVA FUNCIÓN: ACTUALIZAR USUARIO (PUT)
    // ==========================================
    public function updateUser(Request $request, $id)
    {
        // 1. Buscamos el usuario (Si no existe, devuelve error 404 automático)
        $user = User::findOrFail($id);

        // 2. Validamos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Importante: Validamos que el username sea único, PERO ignorando al usuario actual
            // (si no, dará error de que "el usuario ya existe" al guardar sin cambiar el nombre)
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:superadmin,admin,editor,lector', // Ajusta los roles según tu frontend
            'password' => 'nullable|string|min:6' // La contraseña es opcional aquí
        ]);

        // 3. Actualizamos datos básicos
        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->role = $validated['role'];

        // 4. Solo si escribieron una contraseña nueva, la actualizamos
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json(['message' => 'Usuario actualizado', 'user' => $user]);
    }
    // ==========================================

    public function deleteUser($id)
    {
        if (Auth::id() == $id) return response()->json(['message' => 'No puedes eliminarte a ti mismo'], 403);
        User::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }

    // --- PERFIL (Del usuario logueado) ---
    public function getProfile()
    {
        return response()->json(Auth::user());
    }

    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['nullable', 'email', Rule::unique('users')->ignore($user->id)],
        ]);
        $user->update($validated);
        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $request->validate(['current_password' => 'required', 'new_password' => 'required|min:6']);
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Contraseña incorrecta'], 400);
        }
        $user->update(['password' => Hash::make($request->new_password)]);
        return response()->json(['message' => 'Actualizado']);
    }
}
