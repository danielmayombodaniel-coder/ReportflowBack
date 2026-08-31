import bcrypt from 'bcryptjs';
import Admin from '../../models/admin.model.js';
import AppError from '../../utils/app-error.js';

/**
 * Initialise le premier administrateur
 * @route POST /api/admin/setup
 * @body {string} email - Email de l'administrateur
 * @body {string} password - Mot de passe de l'administrateur
 * @returns {Promise<Object>} Confirmation de création
 */
export const setupAdmin = async (req, res, next) => {
  try {
    // Vérifier qu'aucun admin n'existe déjà
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return next(new AppError(400, 'Un administrateur existe déjà'));
    }

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new AppError(400, 'Email et mot de passe requis'));
    }

    if (password.length < 6) {
      return next(new AppError(400, 'Le mot de passe doit contenir au moins 6 caractères'));
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'admin
    const admin = await Admin.create({
      email,
      password: hashedPassword
    });

    res.status(201).json({
      status: 'success',
      message: 'Administrateur créé avec succès',
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