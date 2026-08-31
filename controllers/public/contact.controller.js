import Message from '../../models/message.model.js';
import Admin from '../../models/admin.model.js';
import AppError from '../../utils/app-error.js';
import logger from '../../utils/logger.js';

/**
 * Récupère les informations de contact de l'auteur
 * @route GET /api/public/getcontact
 */
export const getContactInfo = async (req, res, next) => {
  try {
    const admin = await Admin.findOne().select('email_contact telephone');
    
    if (!admin) {
      return res.status(200).json({
        status: 'success',
        data: {
          email_contact: '',
          telephone: ''
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        email_contact: admin.email_contact || '',
        telephone: admin.telephone || ''
      }
    });
  } catch (err) {
    logger.error({ err }, 'Error in getContactInfo');
    return next(new AppError(500, err.message));
  }
};

/**
 * Envoie un message de contact
 * @route POST /api/public/contact
 */
export const sendContactMessage = async (req, res, next) => {
  try {
    const { nom, email, sujet, message } = req.body;

    // Créer le message en base
    const newMessage = new Message({
      nom,
      email,
      sujet,
      contenu: message,
      statut: 'non_lu'
    });

    await newMessage.save();

    logger.info({ messageId: newMessage._id, email }, 'Nouveau message de contact reçu');

    res.status(201).json({
      status: 'success',
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons bientôt.',
      data: {
        id: newMessage._id
      }
    });
  } catch (err) {
    logger.error({ err }, 'Error in sendContactMessage');
    return next(new AppError(500, err.message));
  }
};

export default { sendContactMessage, getContactInfo };