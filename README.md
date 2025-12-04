# Avalivros - Letterboxd de Livros

Uma aplicação web para avaliação e registro de livros, inspirada no Letterboxd (plataforma de avaliação de filmes).

## Funcionalidades

- **Livros**: Cadastro e visualização de livros com informações como título, autor, ISBN, ano de publicação, descrição, capa e número de páginas
- **Avaliações**: Sistema de avaliação de livros com notas de 1 a 5 estrelas e texto de review
- **Listas de Leitura**: Criação de listas personalizadas para organizar livros
- **Perfis de Usuário**: Cada usuário pode ter suas próprias avaliações e listas

## Estrutura do Projeto

### Models
- `Book`: Modelo para livros
- `Review`: Modelo para avaliações de livros
- `ReadingList`: Modelo para listas de leitura
- `User`: Modelo de usuário (estendido com relacionamentos)

### Controllers
- `BookController`: CRUD completo para livros
- `ReviewController`: CRUD completo para avaliações

### Migrations
- `create_books_table`: Tabela de livros
- `create_reviews_table`: Tabela de avaliações
- `create_reading_lists_table`: Tabela de listas de leitura e tabela pivot

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   composer install
   npm install
   ```
3. Configure o arquivo `.env` com suas credenciais de banco de dados
4. Execute as migrations:
   ```bash
   php artisan migrate
   ```
5. Inicie o servidor:
   ```bash
   php artisan serve
   ```

## Laradock

A pasta `laradock` está preparada para configuração do ambiente Docker usando Laradock. Para configurar:

1. Clone o Laradock na pasta `laradock`:
   ```bash
   cd laradock
   git clone https://github.com/laradock/laradock.git .
   ```
2. Configure os arquivos `.env` do Laradock conforme necessário
3. Inicie os containers:
   ```bash
   docker-compose up -d nginx mysql phpmyadmin
   ```

## Tecnologias

- Laravel 12
- PHP 8.2+
- MySQL/PostgreSQL
- Docker (Laradock)

## Licença

MIT
