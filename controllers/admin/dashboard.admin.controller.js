import Book from '../../models/book.model.js';
import Message from '../../models/message.model.js';
import AppError from '../../utils/app-error.js';

/**
 * Récupère les données du dashboard admin
 * @route GET /api/admin/dashboard
 * @returns {Promise<Object>} Données du dashboard
 */
export const getDashboard = async (req, res, next) => {
  try {
    // Compter les livres
    const nombre_livres = await Book.countDocuments();
    
    // Compter les messages
    const nombre_messages = await Message.countDocuments();
    
    // Compter les livres gratuits et payants
    const livres_gratuits = await Book.countDocuments({ prix: 0 });
    const livres_payants = await Book.countDocuments({ prix: { $gt: 0 } });

    const dashboardData = {
      nombre_livres,
      nombre_ventes: 0, // Pas de système de vente pour l'instant
      nombre_messages,
      statistiques_simples: {
        ventes_last_7_days: [],
        revenus_total: 0,
        ventes_ce_mois: 0,
        livres_gratuits,
        livres_payants
      }
    };

    res.status(200).json({
      status: 'success',
      data: dashboardData
    });
  } catch (err) {
    next(new AppError(500, err.message));
  }
};