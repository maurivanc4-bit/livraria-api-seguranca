# API Livraria — Documentação OpenAPI e Segurança

API REST desenvolvida em Node.js + Express, organizada em controllers, services, repositories, routes e middlewares. Esta versão documenta os endpoints com OpenAPI 3.0.3 e Swagger UI e mantém autenticação JWT, hash BCrypt e autorização por perfil (RBAC).

## Requisitos
- Node.js 18 ou superior
- npm

## Instalação e execução
```bash
npm install
cp .env.example .env
npm start
```
No Windows PowerShell, se `cp` não funcionar, use `Copy-Item .env.example .env`.

Servidor local: `http://localhost:3000`
- Swagger UI interativo: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- URL alternativa do JSON: `http://localhost:3000/docs/api.json`
- Health check: `http://localhost:3000/health`

## Como testar pelo Swagger
1. Abra `http://localhost:3000/docs`.
2. Execute `POST /api/v1/auth/login` com uma das credenciais abaixo.
3. Copie somente o valor do campo `token` retornado.
4. Clique em **Authorize** e cole o token, sem digitar `Bearer ` (a interface adiciona o prefixo).
5. Feche a janela de autorização e teste as rotas protegidas.

Credenciais iniciais de laboratório:
- ADMIN: `admin@livraria.com` / `admin123`
- USER: `leitor@gmail.com` / `leitor123`

A base `database.txt` é criada automaticamente na primeira execução. Para recriar os usuários de laboratório em ambiente local limpo, pare o servidor e apague esse arquivo; a próxima inicialização recria a base. Isso apaga os dados locais cadastrados.

## Endpoints e permissões
| Método | Rota | Acesso | Sucesso |
| --- | --- | --- | --- |
| GET | `/api/v1/livros` | Público | 200 |
| GET | `/api/v1/livros/{id}` | Público | 200 |
| POST | `/api/v1/auth/register` | Público; sempre cria USER | 201 |
| POST | `/api/v1/auth/login` | Público | 200 |
| POST | `/api/v1/livros/{id}/comentarios` | USER ou ADMIN autenticado | 201 |
| POST | `/api/v1/autores` | Somente ADMIN | 201 |
| POST | `/api/v1/livros` | Somente ADMIN | 201 |

Os contratos de entrada e saída, exemplos e respostas de erro estão descritos nos endpoints da documentação OpenAPI. A validação atual da aplicação retorna HTTP 400 para os dados inválidos; o contrato OpenAPI também registra 422 para clientes que tratem a entrada como entidade não processável.

## Segurança
- As senhas são armazenadas com BCrypt (custo 10), nunca em texto puro.
- O login emite JWT com validade configurada por `JWT_EXPIRES_IN` (padrão `2h`).
- O middleware valida o JWT no cabeçalho `Authorization: Bearer <token>`.
- Cadastro público sempre cria perfil `USER`; o cliente não pode escolher o próprio perfil.
- Apenas `ADMIN` pode cadastrar livros e autores.
- `JWT_SECRET` deve ser substituído por um segredo forte fora do ambiente de laboratório. Não envie `.env` nem `database.txt` ao GitHub.

## Exemplos de corpos JSON
Cadastro:
```json
{ "nome": "Maria Silva", "email": "maria@gmail.com", "senha": "senha123" }
```
Login:
```json
{ "email": "admin@livraria.com", "senha": "admin123" }
```
Cadastro de autor (ADMIN):
```json
{ "nome": "Clarice Lispector", "nacionalidade": "Brasileira" }
```
Cadastro de livro (ADMIN):
```json
{ "titulo": "A Hora da Estrela", "ano": 1977, "autor_id": 1 }
```
Comentário (USER ou ADMIN):
```json
{ "texto": "Uma leitura marcante." }
```
