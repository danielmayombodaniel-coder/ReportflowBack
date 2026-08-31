import Admin from '../../models/admin.model.js';
import AppError from '../../utils/app-error.js';

/**
 * Vérifie si un administrateur existe déjà
 * @route GET /api/admin/check-setup
 * @returns {Promise<Object>} Status de l'installation
 */
export const checkSetup = async (req, res, next) => {
  try {
    const adminCount = await Admin.countDocuments();
    
    res.status(200).json({
      status: 'success',
      data: {
        setupRequired: adminCount === 0
      }
    });
  } catch (err) {
    next(new AppError(500, err.message));
  }
};