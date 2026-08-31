import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import AppError from '../utils/app-error.js';

/**
 * Middleware d'authentification pour les administrateurs
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    // Récupérer le token depuis les headers ou les cookies
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError(401, 'Token d\'authentification requis'));
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'admin existe toujours
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(new AppError(401, 'Administrateur non trouvé'));
    }

    // Pas besoin de vérifier le rôle car c'est déjà un admin
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError(401, 'Token invalide'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Token expiré'));
    }
    next(new AppError(500, err.message));
  }
};