<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     * Gera um username único baseado no nome do usuário se não foi fornecido.
     */
    public function creating(User $user): void
    {
        if (empty($user->username)) {
            $user->username = $this->generateUniqueUsername($user->name);
        }
    }

    /**
     * Gera um username único baseado no nome.
     */
    private function generateUniqueUsername(string $name): string
    {
        // Remove acentos e caracteres especiais
        $username = \Illuminate\Support\Str::slug($name, '');
        
        // Remove espaços e deixa minúsculo
        $username = strtolower(str_replace(' ', '', $username));
        
        // Se estiver vazio, usa um padrão
        if (empty($username)) {
            $username = 'usuario';
        }
        
        // Verifica se já existe e adiciona número se necessário
        $originalUsername = $username;
        $counter = 1;
        
        // Durante a criação, não precisamos verificar o ID do usuário atual
        while (User::where('username', $username)->exists()) {
            $username = $originalUsername . $counter;
            $counter++;
        }
        
        return $username;
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
