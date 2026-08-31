import Message from '../../models/message.model.js';
import AppError from '../../utils/app-error.js';
import logger from '../../utils/logger.js';

/**
 * Récupère tous les messages
 * @route GET /api/admin/messages
 */
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({}).sort({ created_at: -1 }).lean();
    
    res.status(200).json({
      status: 'success',
      data: {
        messages
      }
    });
  } catch (err) {
    logger.error({ err }, 'Error in getMessages');
    return next(new AppError(500, err.message));
  }
};

/**
 * Récupère un message par ID et le marque comme lu
 * @route GET /api/admin/messages/:id
 */
export const getMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      return next(new AppError(404, 'Message non trouvé'));
    }
    
    // Marquer comme lu si ce n'était pas déjà fait
    if (message.statut === 'non_lu') {
      message.statut = 'lu';
      await message.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: message
    });
  } catch (err) {
    logger.error({ err }, 'Error in getMessage');
    return next(new AppError(500, err.message));
  }
};

/**
 * Met à jour le statut d'un message
 * @route PUT /api/admin/messages/:id/status
 */
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    
    if (!['non_lu', 'lu', 'repondu'].includes(statut)) {
      return next(new AppError(400, 'Statut invalide'));
    }
    
    const message = await Message.findByIdAndUpdate(
      id,
      { statut },
      { new: true }
    );
    
    if (!message) {
      return next(new AppError(404, 'Message non trouvé'));
    }
    
    res.status(200).json({
      status: 'success',
      data: message
    });
  } catch (err) {
    logger.error({ err }, 'Error in updateMessageStatus');
    return next(new AppError(500, err.message));
  }
};

/**
 * Supprime un message
 * @route DELETE /api/admin/messages/:id
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return next(new AppError(404, 'Message non trouvé'));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Message supprimé avec succès'
    });
  } catch (err) {
    logger.error({ err }, 'Error in deleteMessage');
    return next(new AppError(500, err.message));
  }
};

/**
 * Récupère le nombre de messages non lus
 * @route GET /api/admin/messages/unread/count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ statut: 'non_lu' });
    
    res.status(200).json({
      status: 'success',
      data: { count }
    });
  } catch (err) {
    logger.error({ err }, 'Error in getUnreadCount');
    return next(new AppError(500, err.message));
  }
};

export default { getMessages, getMessage, updateMessageStatus, deleteMessage, getUnreadCount };