<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $loginUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $loginUrl)
    {
        $this->user = $user;
        $this->loginUrl = $loginUrl;
    }

    /**
     * Get the message envelope (Assunto e Remetente).
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            // Opcional: definir remetente aqui ou via .env (MAIL_FROM_ADDRESS / MAIL_FROM_NAME)
            subject: 'Bem-vindo à biblioteca do AvaLivros! 📚',
            // Opcional: Tags do Resend para analytics
            metadata: [
                'user_id' => (string) $this->user->id,
                'type' => 'welcome_email'
            ]
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.welcome-email',
        );
    }
}