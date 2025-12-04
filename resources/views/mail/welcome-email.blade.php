<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Bem-vindo ao AvaLivros</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0b0a0a; color: #f5f5f5; padding: 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a;">
        <tr>
            <td style="padding: 32px;">
                <h1 style="margin: 0 0 16px; font-size: 24px; color: #facc15;">
                    Bem-vindo à sua biblioteca, {{ $user->name ?? 'leitor(a)' }} 📚
                </h1>

                <p style="margin: 0 0 12px; font-size: 14px; color: #e5e5e5;">
                    Que bom ter você no <strong>AvaLivros</strong>. A partir de agora, cada página lida pode virar memória guardada.
                </p>

                <p style="margin: 0 0 24px; font-size: 14px; color: #d4d4d8;">
                    Clique no botão abaixo para acessar sua estante e começar a registrar suas leituras.
                </p>

                <p style="margin: 0 0 32px; text-align: center;">
                    <a href="{{ $loginUrl }}"
                       style="display: inline-block; padding: 12px 24px; background-color: #facc15; color: #18181b; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 14px;">
                        Abrir minha estante
                    </a>
                </p>

                        <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa;">
                    Se o botão não funcionar, copie e cole este link no navegador:
                </p>
                <p style="margin: 0 0 24px; font-size: 12px; color: #71717a; word-break: break-all;">
                    {{ $loginUrl }}
                </p>

                <p style="margin: 0; font-size: 12px; color: #71717a;">
                    Com carinho,<br>
                    <strong>{{ config('app.name') }}</strong>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
