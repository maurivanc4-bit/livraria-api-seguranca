const { Router } = require('express');
const controller = require('../controllers/AutorController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');
const router = Router();

/**
 * @swagger
 * /api/v1/autores:
 *   get:
 *     tags: [Autores]
 *     summary: Listar autores
 *     description: Retorna os autores cadastrados. Rota pública.
 *     responses:
 *       '200':
 *         description: Lista de autores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Autor' }
 *             example:
 *               - { id: 1, nome: Machado de Assis, nacionalidade: Brasileiro }
 */
router.get('/', (req, res, next) => controller.index(req, res, next));

/**
 * @swagger
 * /api/v1/autores:
 *   post:
 *     tags: [Autores]
 *     summary: Cadastrar autor (ADMIN)
 *     description: Requer JWT válido de um usuário com perfil ADMIN. Usuários USER recebem 403.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AutorEntrada' }
 *           example: { nome: Clarice Lispector, nacionalidade: Brasileira }
 *     responses:
 *       '201':
 *         description: Autor cadastrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Autor' }
 *             example: { id: 1726000000000, nome: Clarice Lispector, nacionalidade: Brasileira }
 *       '400':
 *         description: Nome do autor obrigatório ou inválido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'O nome do autor é obrigatório.' }
 *       '422':
 *         description: Corpo da requisição inválido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Dados do autor inválidos.' }
 *       '401':
 *         description: Token ausente, inválido ou expirado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Token inválido ou expirado.' }
 *       '403':
 *         description: Perfil diferente de ADMIN.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Acesso proibido: privilégio de ADMIN exigido.' }
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

module.exports = router;
