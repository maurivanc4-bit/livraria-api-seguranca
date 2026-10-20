require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/authRoutes');
const livroRoutes = require('./routes/livroRoutes');
const autorRoutes = require('./routes/autorRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Livraria - Livros e Autores',
      version: '1.2.0',
      description: 'Contrato OpenAPI da API de Livros e Autores. As rotas administrativas exigem perfil ADMIN. Comentários exigem JWT de usuário USER ou ADMIN. Faça login, copie somente o campo token e use Authorize.'
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    tags: [
      { name: 'Autenticação', description: 'Cadastro de usuário e emissão de JWT' },
      { name: 'Livros', description: 'Consulta, cadastro de livros e comentários' },
      { name: 'Autores', description: 'Consulta e cadastro de autores' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
          description: 'JWT obtido em POST /api/v1/auth/login. Cole apenas o token; Swagger acrescenta Bearer.'
        }
      },
      schemas: {
        UsuarioCadastro: {
          type: 'object', required: ['nome', 'email', 'senha'], additionalProperties: false,
          properties: {
            nome: { type: 'string', minLength: 1, example: 'Maria Silva' },
            email: { type: 'string', format: 'email', example: 'maria@gmail.com' },
            senha: { type: 'string', format: 'password', minLength: 6, example: 'senha123' }
          }
        },
        Usuario: {
          type: 'object', required: ['id', 'nome', 'email', 'role'],
          properties: {
            id: { type: 'integer', example: 1726000000000 },
            nome: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', format: 'email', example: 'maria@gmail.com' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' }
          }
        },
        Login: {
          type: 'object', required: ['email', 'senha'], additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@livraria.com' },
            senha: { type: 'string', format: 'password', example: 'admin123' }
          }
        },
        LoginResposta: {
          type: 'object', required: ['usuario', 'token', 'tipo', 'expiresIn'],
          properties: {
            usuario: { $ref: '#/components/schemas/Usuario' },
            token: { type: 'string', description: 'Token JWT assinado para autenticação Bearer', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIn0.exemplo' },
            tipo: { type: 'string', enum: ['Bearer'], example: 'Bearer' },
            expiresIn: { type: 'string', example: '2h' }
          }
        },
        AutorEntrada: {
          type: 'object', required: ['nome'],
          properties: {
            nome: { type: 'string', minLength: 1, example: 'Clarice Lispector' },
            nacionalidade: { type: 'string', example: 'Brasileira' }
          }
        },
        Autor: {
          type: 'object', required: ['id', 'nome', 'nacionalidade'],
          properties: {
            id: { type: 'integer', example: 1726000000000 },
            nome: { type: 'string', example: 'Clarice Lispector' },
            nacionalidade: { type: 'string', example: 'Brasileira' }
          }
        },
        LivroEntrada: {
          type: 'object', required: ['titulo', 'autor_id'],
          properties: {
            titulo: { type: 'string', minLength: 1, example: 'A Hora da Estrela' },
            ano: { type: 'integer', example: 1977 },
            autor_id: { type: 'integer', minimum: 1, example: 1 }
          }
        },
        Livro: {
          type: 'object', required: ['id', 'titulo', 'ano', 'autor_id', 'comentarios'],
          properties: {
            id: { type: 'integer', example: 1726000000000 },
            titulo: { type: 'string', example: 'A Hora da Estrela' },
            ano: { type: 'integer', example: 1977 },
            autor_id: { type: 'integer', example: 1 },
            autor_nome: { type: 'string', example: 'Clarice Lispector' },
            comentarios: { type: 'array', items: { $ref: '#/components/schemas/Comentario' } }
          }
        },
        ComentarioEntrada: {
          type: 'object', required: ['texto'],
          properties: { texto: { type: 'string', minLength: 1, example: 'Uma leitura marcante.' } }
        },
        Comentario: {
          type: 'object', required: ['id', 'autor_nome', 'texto'],
          properties: {
            id: { type: 'integer', example: 1726000000000 },
            autor_nome: { type: 'string', example: 'Leitor' },
            texto: { type: 'string', example: 'Uma leitura marcante.' }
          }
        },
        Erro: {
          type: 'object', required: ['erro'],
          properties: { erro: { type: 'string', example: 'Dados inválidos.' } }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};
const openapiSpec = swaggerJsdoc(swaggerOptions);
app.get('/docs/api.json', (req, res) => res.json(openapiSpec));
app.get('/openapi.json', (req, res) => res.json(openapiSpec));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  swaggerOptions: { persistAuthorization: true }
}));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/livros', livroRoutes);
app.use('/api/v1/autores', autorRoutes);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => console.log(`Livraria API rodando em http://localhost:${PORT} — documentação: /docs`));
}
module.exports = app;
