const { Router } = require('express');
const controller = require('../controllers/AuthController');
const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Autenticação]
 *     summary: Cadastrar usuário
 *     description: Rota pública. A senha é armazenada com BCrypt e o perfil criado é sempre USER. Um campo role enviado pelo cliente não concede privilégios.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCadastro'
 *           example:
 *             nome: Maria Silva
 *             email: maria@gmail.com
 *             senha: senha123
 *     responses:
 *       '201':
 *         description: Usuário cadastrado; o hash da senha não é retornado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *             example: { id: 1726000000000, nome: Maria Silva, email: maria@gmail.com, role: USER }
 *       '400':
 *         description: Campos obrigatórios ausentes ou inválidos.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.' }
 *       '422':
 *         description: Entidade não processável quando o corpo não atende ao contrato de entrada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Dados de cadastro inválidos.' }
 *       '409':
 *         description: E-mail já cadastrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'E-mail já cadastrado no sistema.' }
 */
router.post('/register', (req, res, next) => controller.register(req, res, next));

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Entrar e obter token JWT
 *     description: Valida as credenciais e retorna um JWT. Use o valor de token no botão Authorize para testar rotas protegidas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Login' }
 *           example:
 *             email: admin@livraria.com
 *             senha: admin123
 *     responses:
 *       '200':
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResposta' }
 *             example:
 *               usuario: { id: 1, nome: Admin, email: admin@livraria.com, role: ADMIN }
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo.assinatura
 *               tipo: Bearer
 *               expiresIn: 2h
 *       '400':
 *         description: E-mail ou senha ausentes.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'E-mail e senha são obrigatórios.' }
 *       '422':
 *         description: Corpo da requisição inválido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Dados de login inválidos.' }
 *       '401':
 *         description: E-mail ou senha incorretos.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Credenciais inválidas.' }
 */
router.post('/login', (req, res, next) => controller.login(req, res, next));

module.exports = router;
