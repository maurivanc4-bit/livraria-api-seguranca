const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

class LivrariaRepository {
  constructor() {
    this.dbPath = path.resolve(process.cwd(), 'database.txt');
    this._garantirArquivoInicial();
  }

  _obterDadosPadrao() {
    // Credenciais iniciais de laboratório; senhas são armazenadas apenas como hashes BCrypt.
    return {
      usuarios: [
        { id: 1, nome: 'Admin', email: 'admin@livraria.com', senha_hash: bcrypt.hashSync('admin123', 10), role: 'ADMIN' },
        { id: 2, nome: 'Leitor', email: 'leitor@gmail.com', senha_hash: bcrypt.hashSync('leitor123', 10), role: 'USER' }
      ],
      autores: [{ id: 1, nome: 'Machado de Assis', nacionalidade: 'Brasileiro' }],
      livros: [{
        id: 1, titulo: 'Dom Casmurro', ano: 1899, autor_id: 1,
        comentarios: [{ id: 1, autor_nome: 'Leitor', texto: 'Clássico indispensável.' }]
      }]
    };
  }

  _garantirArquivoInicial() {
    try {
      if (!fs.existsSync(this.dbPath) || !fs.readFileSync(this.dbPath, 'utf-8').trim()) {
        this.salvar(this._obterDadosPadrao());
      }
    } catch (err) {
      console.error('Erro ao inicializar database.txt:', err.message);
    }
  }

  carregar() {
    this._garantirArquivoInicial();
    try {
      return JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
    } catch (e) {
      throw { status: 500, message: 'Não foi possível ler os dados da livraria.' };
    }
  }

  salvar(dados) {
    fs.writeFileSync(this.dbPath, JSON.stringify(dados, null, 2), 'utf-8');
  }

  buscarUsuarioPorEmail(email) {
    return this.carregar().usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  salvarUsuario(usuario) {
    const db = this.carregar();
    const novoUsuario = { id: Date.now(), ...usuario };
    db.usuarios.push(novoUsuario);
    this.salvar(db);
    return novoUsuario;
  }

  listarAutores() { return this.carregar().autores || []; }
  buscarAutorPorId(id) { return (this.carregar().autores || []).find(a => a.id === Number(id)) || null; }

  salvarAutor(autor) {
    const db = this.carregar();
    const novoAutor = { id: Date.now(), ...autor };
    db.autores.push(novoAutor);
    this.salvar(db);
    return novoAutor;
  }

  listarLivros() { return this.carregar().livros || []; }
  buscarLivroPorId(id) { return (this.carregar().livros || []).find(l => l.id === Number(id)) || null; }

  salvarLivro(livro) {
    const db = this.carregar();
    const novoLivro = { id: Date.now(), ...livro, comentarios: [] };
    db.livros.push(novoLivro);
    this.salvar(db);
    return novoLivro;
  }

  adicionarComentario(livroId, comentario) {
    const db = this.carregar();
    const livro = db.livros.find(l => l.id === Number(livroId));
    if (!livro) return null;
    if (!livro.comentarios) livro.comentarios = [];
    const novoComentario = { id: Date.now(), ...comentario };
    livro.comentarios.push(novoComentario);
    this.salvar(db);
    return novoComentario;
  }
}

module.exports = new LivrariaRepository();
