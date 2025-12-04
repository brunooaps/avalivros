<?php

namespace App\Http\Controllers;

use App\Jobs\SendWelcomeEmailJob;
use App\Models\MagicLink;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MagicLinkController extends Controller
{
    /**
     * Envia link mágico de login para um usuário já existente.
     */
    public function sendLoginLink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            Log::warning('Magic link login solicitado para email não encontrado', [
                'email' => $validated['email'],
            ]);
            return response()->json([
                'message' => 'Usuário não encontrado.',
            ], 404);
        }

        // Aqui você poderia gerar e salvar um token de login mágico
        // e passá-lo para o e-mail. Por enquanto, apenas disparamos o job.
        SendWelcomeEmailJob::dispatch($user);

        Log::info('Magic link de login enviado com sucesso', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        return response()->json([
            'message' => 'Link mágico enviado para o e-mail cadastrado.',
        ]);
    }

    /**
     * Cadastra um novo usuário e envia link mágico de boas-vindas.
     */
    public function registerWithMagicLink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
        ]);

        SendWelcomeEmailJob::dispatch($user);

        Log::info('Usuário cadastrado com magic link', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        return response()->json([
            'message' => 'Cadastro realizado com sucesso. Enviamos um link mágico para o seu e-mail.',
        ], 201);
    }

    /**
     * Consome o link mágico, autentica o usuário e invalida o token.
     */
    public function consumeMagicLink(string $token): RedirectResponse
    {
        $magicLink = MagicLink::with('user')
            ->where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        if (! $magicLink || ! $magicLink->user) {
            Log::warning('Tentativa de uso de magic link inválido ou expirado', [
                'token' => $token,
            ]);
            return redirect('/login')->with('error', 'Link mágico inválido ou expirado. Solicite um novo.');
        }

        // Marca como usado para não reutilizar o mesmo token
        $magicLink->forceFill([
            'used_at' => now(),
        ])->save();

        // Autentica o usuário
        Auth::login($magicLink->user, remember: true);

        Log::info('Usuário autenticado via magic link', [
            'user_id' => $magicLink->user->id,
            'email'   => $magicLink->user->email,
            'token_id'=> $magicLink->id,
        ]);

        // Redireciona para a home ou dashboard
        return redirect('/');
    }
}


