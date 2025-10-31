const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ message: 'Token manquant'});

      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Accès refusé : rôle non autorisé' });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Token invalide' });
    }
  };
};

module.exports = authMiddleware;
