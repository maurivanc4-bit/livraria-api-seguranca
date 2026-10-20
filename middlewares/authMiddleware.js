const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-desenvolvimento-trocar-em-producao';

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação ausente. Use Authorization: Bearer <token>.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = {
      id: Number(payload.sub),
      nome: payload.nome,
      role: payload.role
    };
    return next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function exigirRole(roleEsperada) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Autenticação necessária.' });
    }
    if (req.usuario.role !== roleEsperada) {
      return res.status(403).json({ erro: `Acesso proibido: privilégio de ${roleEsperada} exigido.` });
    }
    return next();
  };
}

module.exports = { autenticarToken, exigirRole };
