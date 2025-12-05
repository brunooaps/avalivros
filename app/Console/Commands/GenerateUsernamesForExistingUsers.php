<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateUsernamesForExistingUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:generate-usernames';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gera usernames para usuários existentes que não possuem username';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::whereNull('username')->orWhere('username', '')->get();
        
        if ($users->isEmpty()) {
            $this->info('Todos os usuários já possuem username.');
            return 0;
        }

        $this->info("Encontrados {$users->count()} usuários sem username.");
        
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            $username = $this->generateUniqueUsername($user->name);
            $user->update(['username' => $username]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Usernames gerados com sucesso!');

        return 0;
    }

    /**
     * Gera um username único baseado no nome.
     */
    private function generateUniqueUsername(string $name): string
    {
        // Remove acentos e caracteres especiais
        $username = Str::slug($name, '');
        
        // Remove espaços e deixa minúsculo
        $username = strtolower(str_replace(' ', '', $username));
        
        // Se estiver vazio, usa um padrão
        if (empty($username)) {
            $username = 'usuario';
        }
        
        // Verifica se já existe e adiciona número se necessário
        $originalUsername = $username;
        $counter = 1;
        
        while (User::where('username', $username)->exists()) {
            $username = $originalUsername . $counter;
            $counter++;
        }
        
        return $username;
    }
}
