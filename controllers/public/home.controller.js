import Author from '../../models/author.model.js';
import Book from '../../models/book.model.js';
import AppError from '../../utils/app-error.js';
import logger from '../../utils/logger.js';

/**
 * Récupère les informations de la page d'accueil publique
 * @route GET /api/public/home
 * @returns {Promise<Object>} Informations auteur + livre mis en avant
 */
export const getHome = async (req, res, next) => {
  try {
    // Récupérer l'auteur (il n'y a qu'un seul document Author)
    let author = await Author.findOne().lean();

    // Valeurs par défaut si aucun auteur
    if (!author) {
      author = {
        nom: 'Nom de l\'auteur',
        photo: `${req.protocol}://${req.get('host')}/static/images/default_image_actus.png`,
        biographie: 'Biographie à venir...',
        short_biographie: 'Découvrez l\'univers de cet auteur passionné.',
        message_accroche: 'Bienvenue dans mon univers littéraire'
      };
    }

    // Récupérer le premier livre mis en avant
    const featuredBook = await Book.findOne({ is_featured: true })
      .sort({ created_at: -1 })
      .select('titre description extrait couverture statut prix')
      .lean();

    // Formater le livre mis en avant
    let livreAvant = null;
    if (featuredBook) {
      livreAvant = {
        devise : featuredBook.devise,
        id: featuredBook._id,
        titre: featuredBook.titre,
        resume_court: featuredBook.extrait || featuredBook.description || '',
        couverture: featuredBook.couverture || '',
        statut: featuredBook.statut || 'gratuit',
        prix: featuredBook.prix || 0
      };
    }

    // Construire la courte biographie si absente
    const courteBio = author.short_biographie && author.short_biographie.length
      ? author.short_biographie
      : (author.biographie ? author.biographie.slice(0, 300) + '...' : 'Découvrez l\'univers de cet auteur.');

    return res.status(200).json({
      status: 'success',
      data: {
        nom_auteur: author.nom || 'Nom de l\'auteur',
        photo_auteur: author.photo && author.photo.length ? author.photo : `${req.protocol}://${req.get('host')}/static/images/default_image_auteur.png`,
        courte_biographie: courteBio,
        livre_mis_en_avant: livreAvant,
        message_accroche: author.message_accroche || 'Bienvenue dans mon univers littéraire'
      }
    });
  } catch (err) {
    logger.error({ err }, 'Error fetching public home');
    return next(new AppError(500, err.message));
  }
};

export default { getHome };