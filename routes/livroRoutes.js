const { Router } = require('express');
const controller = require('../controllers/LivroController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');
const router = Router();

/**
 * @swagger
 * /api/v1/livros:
 *   get:
 *     tags: [Livros]
 *     summary: Listar livros
 *     description: Retorna os livros cadastrados, incluindo nome do autor e comentários. Rota pública.
 *     responses:
 *       '200':
 *         description: Lista de livros.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Livro' }
 *             example:
 *               - id: 1
 *                 titulo: Dom Casmurro
 *                 ano: 1899
 *                 autor_id: 1
 *                 autor_nome: Machado de Assis
 *                 comentarios:
 *                   - { id: 1, autor_nome: Leitor, texto: 'Clássico indispensável.' }
 *       '500':
 *         description: Erro interno ao consultar os dados.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Não foi possível ler os dados da livraria.' }
 */
router.get('/', (req, res, next) => controller.index(req, res, next));

/**
 * @swagger
 * /api/v1/livros/{id}:
 *   get:
 *     tags: [Livros]
 *     summary: Buscar livro por ID
 *     description: Retorna os dados de um livro específico. Rota pública.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador numérico do livro.
 *         schema: { type: integer, minimum: 1 }
 *         example: 1
 *     responses:
 *       '200':
 *         description: Livro encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Livro' }
 *             example:
 *               id: 1
 *               titulo: Dom Casmurro
 *               ano: 1899
 *               autor_id: 1
 *               autor_nome: Machado de Assis
 *               comentarios: []
 *       '404':
 *         description: Livro não localizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Livro não localizado.' }
 */
router.get('/:id', (req, res, next) => controller.show(req, res, next));

/**
 * @swagger
 * /api/v1/livros:
 *   post:
 *     tags: [Livros]
 *     summary: Cadastrar livro (ADMIN)
 *     description: Requer JWT válido e perfil ADMIN. O autor_id deve corresponder a um autor existente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LivroEntrada' }
 *           example: { titulo: A Hora da Estrela, ano: 1977, autor_id: 1 }
 *     responses:
 *       '201':
 *         description: Livro cadastrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Livro' }
 *             example: { id: 1726000000000, titulo: A Hora da Estrela, ano: 1977, autor_id: 1, comentarios: [] }
 *       '400':
 *         description: Título ou autor_id ausente ou inválido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'O título e o autor_id são obrigatórios.' }
 *       '422':
 *         description: Corpo da requisição inválido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Dados do livro inválidos.' }
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
 *       '404':
 *         description: Autor informado não existe.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'O autor informado não existe.' }
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

/**
 * @swagger
 * /api/v1/livros/{id}/comentarios:
 *   post:
 *     tags: [Livros]
 *     summary: Adicionar comentário a um livro
 *     description: Permitido a qualquer usuário autenticado com perfil USER ou ADMIN. O nome do autor do comentário vem do token validado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador numérico do livro.
 *         schema: { type: integer, minimum: 1 }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ComentarioEntrada' }
 *           example: { texto: 'Uma leitura marcante.' }
 *     responses:
 *       '201':
 *         description: Comentário criado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Comentario' }
 *             example: { id: 1726000000000, autor_nome: Leitor, texto: 'Uma leitura marcante.' }
 *       '400':
 *         description: Texto do comentário ausente ou vazio.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'O texto do comentário não pode estar vazio.' }
 *       '422':
 *         description: Corpo da requisição inválido.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Dados do comentário inválidos.' }
 *       '401':
 *         description: Token ausente, inválido ou expirado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Token inválido ou expirado.' }
 *       '404':
 *         description: Livro não localizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *             example: { erro: 'Livro não localizado.' }
 */
router.post('/:id/comentarios', autenticarToken, (req, res, next) => controller.storeComment(req, res, next));

module.exports = router;
