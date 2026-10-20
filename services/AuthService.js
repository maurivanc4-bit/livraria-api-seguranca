const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/LivrariaRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-desenvolvimento-trocar-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

class AuthService {
  async registrar({ nome, email, senha } = {}) {
    if (typeof nome !== 'string' || !nome.trim() ||
        typeof email !== 'string' || !email.trim() ||
        typeof senha !== 'string' || senha.length < 6) {
      throw { status: 400, message: 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.' };
    }

    const emailNormalizado = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      throw { status: 400, message: 'E-mail inválido.' };
    }
    if (repository.buscarUsuarioPorEmail(emailNormalizado)) {
      throw { status: 409, message: 'E-mail já cadastrado no sistema.' };
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    // O cadastro público sempre cria USER; nunca confiar em role enviada pelo cliente.
    const novoUsuario = repository.salvarUsuario({
      nome: nome.trim(), email: emailNormalizado, senha_hash, role: 'USER'
    });
    const { senha_hash: removida, ...usuarioRetorno } = novoUsuario;
    return usuarioRetorno;
  }

  async login({ email, senha } = {}) {
    if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
      throw { status: 400, message: 'E-mail e senha são obrigatórios.' };
    }

    const usuario = repository.buscarUsuarioPorEmail(email.trim().toLowerCase());
    const senhaValida = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;
    if (!usuario || !senhaValida) {
      throw { status: 401, message: 'Credenciais inválidas.' };
    }

    const token = jwt.sign(
      { sub: String(usuario.id), nome: usuario.nome, role: usuario.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return {
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      token,
      tipo: 'Bearer',
      expiresIn: JWT_EXPIRES_IN
    };
  }
}

module.exports = new AuthService();
