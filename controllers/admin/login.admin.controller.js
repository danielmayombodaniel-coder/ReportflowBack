import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../../models/admin.model.js';
import AppError from '../../utils/app-error.js';

/**
 * Connexion administrateur
 * @route POST /api/admin/login
 * @body {string} email - Email de l'administrateur
 * @body {string} password - Mot de passe de l'administrateur
 * @returns {Promise<Object>} Token JWT et données admin
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new AppError(400, 'Email et mot de passe requis'));
    }

    // Trouver l'admin
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return next(new AppError(401, 'Email ou mot de passe incorrect'));
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return next(new AppError(401, 'Email ou mot de passe incorrect'));
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: {
        admin: {
          id: admin._id,
          email: admin.email
        }
      }
    });
  } catch (err) {
    next(new AppError(500, err.message));
  }
};