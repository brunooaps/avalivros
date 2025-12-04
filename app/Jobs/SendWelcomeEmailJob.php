<?php

namespace App\Jobs;

use App\Mail\WelcomeEmail;
use App\Models\MagicLink;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // Importante: Isso faz ser assíncrono
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SendWelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;

    /**
     * Cria uma nova instância do job.
     * Recebemos o usuário para saber para quem mandar.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Executa o job.
     * Aqui é onde a mágica acontece longe dos olhos do usuário.
     */
    public function handle(): void
    {
        // Gera um token único para login mágico e registra na tabela dedicada
        $token = Str::random(64);

        $magicLink = MagicLink::create([
            'user_id'   => $this->user->id,
            'token'     => $token,
            'expires_at'=> now()->addMinutes(30),
        ]);

        // Monta a URL absoluta usando APP_URL do .env (ex: http://localhost:8000)
        $baseUrl = rtrim(config('app.url'), '/');
        $loginUrl = "{$baseUrl}/magic-login/{$magicLink->token}";

        // Envia o e-mail usando a configuração do mailer no .env
        Mail::to($this->user->email)->send(new WelcomeEmail($this->user, $loginUrl));
    }
}