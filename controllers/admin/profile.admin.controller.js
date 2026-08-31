// import Admin from '../../models/admin.model.js';
// import Author from '../../models/author.model.js';
// import bcrypt from 'bcryptjs';
// import AppError from '../../utils/app-error.js';
// import { uploadBuffer, deleteResource } from '../../utils/cloudinary.js';
// import logger from '../../utils/logger.js';

// const ALLOWED_NETWORKS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'github', 'whatsapp'];

// /**
//  * Récupère le profil admin complet (données admin + auteur)
//  * @route GET /api/admin/profile
//  */
// export const getProfile = async (req, res, next) => {
//   try {
//     // Récupérer les données admin
//     const admin = await Admin.findById(req.admin.id);
//     if (!admin) {
//       return next(new AppError(404, 'Admin non trouvé'));
//     }

//     // Récupérer les données auteur
//     let author = await Author.findOne();
//     if (!author) {
//       author = new Author();
//     }

//     const defaultPhoto = `${req.protocol}://${req.get('host')}/static/images/default_image_actus.png`;
    
//     // Combiner les données
//     const profile = {
//   _id: admin._id,
//   email: admin.email,

//   nom: author.nom || admin.nom || '',
//   biographie: author.biographie || admin.biographie || '',
//   short_biographie: author.short_biographie || admin.short_biographie || '',

//   mon_parcours: author.mon_parcours || admin.mon_parcours || '',
//   mon_univers_litteraire: author.mon_univers_litteraire || admin.mon_univers_litteraire || '',
//   telephone: author.telephone || admin.telephone || '',

//   email_contact: author.email_contact || admin.email_contact || '',
//   message_accroche: author.message_accroche || admin.message_accroche || '',

//   photo: (author.photo && author.photo.length)
//     ? author.photo
//     : (admin.photo && admin.photo.length)
//       ? admin.photo
//       : defaultPhoto,

//   social_links: author.social_links || admin.social_links || []
// };


//     return res.status(200).json({ status: 'success', admin: profile });
//   } catch (err) {
//     logger.error({ err }, 'Error fetching profile');
//     return next(new AppError(500, err.message));
//   }
// };

// /**
//  * Mettre à jour le profil admin complet
//  * @route PUT /api/admin/profile
//  * @description Supports multipart/form-data with optional `image` file and `socials` JSON string
//  */
// export const updateProfile = async (req, res, next) => {
//   try {
//     console.log('=== UPDATE PROFILE DEBUG ===');
//     console.log('Body:', req.body);
//     console.log('File:', req.file);
    
//     const { nom, biographie,telephone,mon_parcours,mon_univers_litteraire, short_biographie, email_contact, message_accroche, email, currentPassword, password, socials } = req.body;
    
//     // Nettoyer l'email si il contient mailto:
//     const cleanEmail = email ? email.replace('mailto:', '') : undefined;
    
//     // Vérification du mot de passe actuel (obligatoire pour toute modification)
//     if (!currentPassword) {
//       console.log('Erreur: Mot de passe actuel manquant');
//       return next(new AppError(400, 'Mot de passe actuel requis'));
//     }

//     // Vérifier l'admin
//     const admin = await Admin.findById(req.admin.id).select('+password');
//     if (!admin) {
//       return next(new AppError(404, 'Admin non trouvé'));
//     }

//     console.log('Debug - currentPassword type:', typeof currentPassword, 'value:', currentPassword);
//     console.log('Debug - admin.password type:', typeof admin.password, 'exists:', !!admin.password);

//     // Vérifier le mot de passe actuel
//     if (!admin.password) {
//       return next(new AppError(500, 'Mot de passe admin non trouvé'));
//     }
    
//     const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
//     if (!isCurrentPasswordValid) {
//       return next(new AppError(401, 'Mot de passe actuel incorrect'));
//     }

//     // Parse socials if provided
//     let parsedSocials = undefined;
//     if (socials) {
//       try {
//         parsedSocials = typeof socials === 'string' ? JSON.parse(socials) : socials;
//       } catch (e) {
//         return next(new AppError(400, 'Format socials invalide (JSON attendu)'));
//       }
//       if (!Array.isArray(parsedSocials)) {
//         return next(new AppError(400, 'Socials doit être un tableau d\'objets {network, url}'));
//       }
//       for (const s of parsedSocials) {
//         if (!s.network || !ALLOWED_NETWORKS.includes(s.network)) {
//           return next(new AppError(400, `Réseau social invalide: ${s.network}`));
//         }
//         if (s.url && typeof s.url !== 'string') {
//           return next(new AppError(400, 'URL invalide pour un réseau social'));
//         }
//       }
//     }

//     // Mise à jour des données admin
//     const adminUpdateData = {};
//     if (nom !== undefined) adminUpdateData.nom = nom;
//     if (cleanEmail !== undefined) adminUpdateData.email = cleanEmail;
//     if (biographie !== undefined) adminUpdateData.biographie = biographie;
//     if (short_biographie !== undefined) adminUpdateData.short_biographie = short_biographie;
//     if (email_contact !== undefined) adminUpdateData.email_contact = email_contact;
//     if (telephone !== undefined) adminUpdateData.telephone = telephone;
//     if (mon_univers_litteraire !== undefined) adminUpdateData.mon_univers_litteraire = mon_univers_litteraire;
//     if (mon_parcours !== undefined) adminUpdateData.mon_parcours = mon_parcours;
//     if (message_accroche !== undefined) adminUpdateData.message_accroche = message_accroche;
//     if (parsedSocials !== undefined) adminUpdateData.social_links = parsedSocials;
//     if (parsedSocials !== undefined) adminUpdateData.social_links = parsedSocials;

//     // Changement de mot de passe si fourni
//     if (password) {
//       if (password.length < 6) {
//         return next(new AppError(400, 'Le nouveau mot de passe doit contenir au moins 6 caractères'));
//       }
//       adminUpdateData.password = await bcrypt.hash(password, 10);
//     }

//     // Handle photo upload
//     if (req.file) {
//       // Supprimer l'ancienne photo si elle existe
//       if (admin.photo_public_id) {
//         try {
//           await deleteResource(admin.photo_public_id, { resource_type: 'image' });
//         } catch (e) {
//           logger.warn({ err: e }, 'Erreur suppression ancienne photo sur Cloudinary');
//         }
//       }

//       try {
//         const uploadResult = await uploadBuffer(req.file.buffer, {
//           folder: 'plume-noire/admin/photos',
//           resource_type: 'image'
//         });
//         adminUpdateData.photo = uploadResult.secure_url;
//         adminUpdateData.photo_public_id = uploadResult.public_id;
//       } catch (e) {
//         logger.error({ err: e }, 'Error uploading profile photo');
//         return next(new AppError(500, 'Erreur upload photo'));
//       }
//     }

//     adminUpdateData.updated_at = new Date();

//     // Mettre à jour l'admin
//     const updatedAdmin = await Admin.findByIdAndUpdate(
//       req.admin.id,
//       { $set: adminUpdateData },
//       { new: true }
//     );

//     // Synchroniser avec le modèle Author pour les données publiques
//     let author = await Author.findOne();
//     if (!author) {
//       author = new Author();
//     }

//     const authorUpdateData = {};
//     if (nom !== undefined) authorUpdateData.nom = nom;
//     if (biographie !== undefined) authorUpdateData.biographie = biographie;
//     if (short_biographie !== undefined) authorUpdateData.short_biographie = short_biographie;
//     if (email_contact !== undefined) authorUpdateData.email_contact = email_contact;
//     if (telephone !== undefined) authorUpdateData.telephone = telephone;
//     if (mon_univers_litteraire !== undefined) authorUpdateData.mon_univers_litteraire = mon_univers_litteraire;
//     if (mon_parcours !== undefined) authorUpdateData.mon_parcours = mon_parcours;
//     if (message_accroche !== undefined) authorUpdateData.message_accroche = message_accroche;
//     if (parsedSocials !== undefined) authorUpdateData.social_links = parsedSocials;
//     if (req.file) {
//       authorUpdateData.photo = adminUpdateData.photo;
//       authorUpdateData.photo_public_id = adminUpdateData.photo_public_id;
//     }
//     authorUpdateData.updated_at = new Date();

//     await Author.findOneAndUpdate({}, { $set: authorUpdateData }, { upsert: true, new: true });

//     const defaultPhoto = `${req.protocol}://${req.get('host')}/static/images/default_image_actus.png`;
//     const profile = {
//       _id: updatedAdmin._id,
//       email: updatedAdmin.email,
//       nom: updatedAdmin.nom || '',
//       telephone: updatedAdmin.telephone || '',
//       mon_univers_litteraire: updatedAdmin.mon_univers_litteraire || '',
//       mon_parcours: updatedAdmin.mon_parcours || '',
//       biographie: updatedAdmin.biographie || '',
//       short_biographie: updatedAdmin.short_biographie || '',
//       email_contact: updatedAdmin.email_contact || '',
//       message_accroche: updatedAdmin.message_accroche || '',
//       photo: (updatedAdmin.photo && updatedAdmin.photo.length) ? updatedAdmin.photo : defaultPhoto,
//       social_links: updatedAdmin.social_links || []
//     };

//     return res.status(200).json({ status: 'success', admin: profile });
//   } catch (err) {
//     logger.error({ err }, 'Error updating profile');
//     return next(new AppError(500, err.message));
//   }
// }; 

// /**
//  * Supprimer la photo du profil (réinitialise à image par défaut)
//  * @route DELETE /api/admin/profil/photo
//  */
// export const deletePhoto = async (req, res, next) => {
//   try {
//     const profile = await Author.findOne();
//     if (!profile || !profile.photo_public_id) {
//       return next(new AppError(400, 'Aucune photo à supprimer'));
//     }

//     try {
//       await deleteResource(profile.photo_public_id, { resource_type: 'image' });
//     } catch (e) {
//       logger.warn({ err: e }, 'Erreur suppression photo sur Cloudinary');
//     }

//     profile.photo = '';
//     profile.photo_public_id = '';
//     profile.updated_at = new Date();
//     await profile.save();

//     const defaultPhoto = `${req.protocol}://${req.get('host')}/static/images/default_image_actus.png`;
//     return res.status(200).json({ status: 'success', profile: { ...profile.toObject(), photo: defaultPhoto } });
//   } catch (err) {
//     logger.error({ err }, 'Error deleting profile photo');
//     return next(new AppError(500, err.message));
//   }
// };

// /**
//  * Supprimer un réseau social par nom (predifined)
//  * @route DELETE /api/admin/profil/socials/:network
//  */
// export const deleteSocial = async (req, res, next) => {
//   try {
//     const { network } = req.params;
//     if (!ALLOWED_NETWORKS.includes(network)) return next(new AppError(400, 'Réseau social inconnu'));

//     const profile = await Author.findOne();
//     if (!profile) return next(new AppError(404, 'Profile not found'));

//     profile.social_links = (profile.social_links || []).filter(s => s.network !== network);
//     profile.updated_at = new Date();
//     await profile.save();

//     return res.status(200).json({ status: 'success', profile });
//   } catch (err) {
//     logger.error({ err }, 'Error deleting social link');
//     return next(new AppError(500, err.message));
//   }
// };

// export default { getProfile, updateProfile, deletePhoto, deleteSocial };
import Admin from '../../models/admin.model.js';
import Author from '../../models/author.model.js';
import bcrypt from 'bcryptjs';
import AppError from '../../utils/app-error.js';
import { uploadBuffer, deleteResource } from '../../utils/cloudinary.js';
import logger from '../../utils/logger.js';

const ALLOWED_NETWORKS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'github', 'whatsapp'];

/**
 * Récupère le profil admin complet (données admin + auteur)
 * @route GET /api/admin/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    // Récupérer les données admin
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return next(new AppError(404, 'Admin non trouvé'));
    }

    // Récupérer les données auteur
    let author = await Author.findOne();
    if (!author) {
      author = new Author();
    }

    const defaultPhoto = `${req.protocol}://${req.get('host')}/static/images/default_image_actus.png`;
    
    // Combiner les données
    const profile = {
      _id: admin._id,
      email: admin.email,
      nom: author.nom || admin.nom || '',
      biographie: author.biographie || admin.biographie || '',
      short_biographie: author.short_biographie || admin.short_biographie || '',
      mon_parcours: author.mon_parcours || admin.mon_parcours || '',
      mon_univers_litteraire: author.mon_univers_litteraire || admin.mon_univers_litteraire || '',
      telephone: author.telephone || admin.telephone || '',
      email_contact: author.email_contact || admin.email_contact || '',
      message_accroche: author.message_accroche || admin.message_accroche || '',
      photo: (author.photo && author.photo.length)
        ? author.photo
        : (admin.photo && admin.photo.length)
          ? admin.photo
          : defaultPhoto,
      social_links: author.social_links || admin.social_links || []
    };

    return res.status(200).json({ status: 'success', admin: profile });
  } catch (err) {
    logger.error({ err }, 'Error fetching profile');
    return next(new AppError(500, err.message));
  }
};

/**
 * Mettre à jour le profil admin complet
 * @route PUT /api/admin/profile
 * @description Supports multipart/form-data with optional `image` file and `socials` JSON string
 */
export const updateProfile = async (req, res, next) => {
  try {
    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { nom, biographie, telephone, mon_parcours, mon_univers_litteraire, short_biographie, email_contact, message_accroche, email, currentPassword, password, socials } = req.body;
    
    // Nettoyer l'email si il contient mailto:
    const cleanEmail = email ? email.replace('mailto:', '') : undefined;
    
    // Vérification du mot de passe actuel (obligatoire pour toute modification)
    if (!currentPassword) {
      console.log('Erreur: Mot de passe actuel manquant');
      return next(new AppError(400, 'Mot de passe actuel requis'));
    }

    // Vérifier l'admin
    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return next(new AppError(404, 'Admin non trouvé'));
    }

    console.log('Debug - currentPassword type:', typeof currentPassword, 'value:', currentPassword);
    console.log('Debug - admin.password type:', typeof admin.password, 'exists:', !!admin.password);

    // Vérifier le mot de passe actuel
    if (!admin.password) {
      return next(new AppError(500, 'Mot de passe admin non trouvé'));
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return next(new AppError(401, 'Mot de passe actuel incorrect'));
    }

    // Parse socials if provided
    let parsedSocials = undefined;
    if (socials) {
      try {
        parsedSocials = typeof socials === 'string' ? JSON.parse(socials) : socials;
      } catch (e) {
        return next(new AppError(400, 'Format socials invalide (JSON attendu)'));
      }
      if (!Array.isArray(parsedSocials)) {
        return next(new AppError(400, 'Socials doit être un tableau d\'objets {network, url}'));
      }
      for (const s of parsedSocials) {
        if (!s.network || !ALLOWED_NETWORKS.includes(s.network)) {
          return next(new AppError(400, `Réseau social invalide: ${s.network}`));
        }
        // MODIFIÉ: Pour WhatsApp, accepter soit un numéro soit une URL
        if (s.network === 'whatsapp') {
          if (s.url && typeof s.url === 'string') {
            // C'est un numéro ou une URL, on garde tel quel
            continue;
          } else {
            return next(new AppError(400, 'Numéro/WhatsApp URL invalide'));
          }
        } else if (s.url && typeof s.url !== 'string') {
          return next(new AppError(400, 'URL invalide pour un réseau social'));
        }
      }
    }

    // Mise à jour des données admin
    const adminUpdateData = {};
    if (nom !== undefined) adminUpdateData.nom = nom;
    if (cleanEmail !== undefined) adminUpdateData.email = cleanEmail;
    if (biographie !== undefined) adminUpdateData.biographie = biographie;
    if (short_biographie !== undefined) adminUpdateData.short_biographie = short_biographie;
    if (email_contact !== undefined) adminUpdateData.email_contact = email_contact;
    if (telephone !== undefined) adminUpdateData.telephone = telephone;
    if (mon_univers_litteraire !== undefined) adminUpdateData.mon_univers_litteraire = mon_univers_litteraire;
    if (mon_parcours !== undefined) adminUpdateData.mon_parcours = mon_parcours;
    if (message_accroche !== undefined) adminUpdateData.message_accroche = message_accroche;
    if (parsedSocials !== undefined) adminUpdateData.social_links = parsedSocials;

    // Changement de mot de passe si fourni
    if (password) {
      if (password.length < 6) {
        return next(new AppError(400, 'Le nouveau mot de passe doit contenir au moins 6 caractères'));
      }
      adminUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Handle photo upload
    if (req.file) {
      // Supprimer l'ancienne photo si elle existe
      if (admin.photo_public_id) {
        try {
          await deleteResource(admin.photo_public_id, { resource_type: 'image' });
        } catch (e) {
          logger.warn({ err: e }, 'Erreur suppression ancienne photo sur Cloudinary');
        }
      }

      try {
        const uploadResult = await uploadBuffer(req.file.buffer, {
          folder: 'plume-noire/admin/photos',
          resource_type: 'image'
        });
        adminUpdateData.photo = uploadResult.secure_url;
        adminUpdateData.photo_public_id = uploadResult.public_id;
      } catch (e) {
        logger.error({ err: e }, 'Error uploading profile photo');
        return next(new AppError(500, 'Erreur upload photo'));
      }
    }

    adminUpdateData.updated_at = new Date();

    // Mettre à jour l'admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { $set: adminUpdateData },
      { new: true }
    );

    // Synchroniser avec le modèle Author pour les données publiques
    let author = await Author.findOne();
    if (!author) {
      author = new Author();
    }

    const authorUpdateData = {};
    if (nom !== undefined) authorUpdateData.nom = nom;
    if (biographie !== undefined) authorUpdateData.biographie = biographie;
    if (short_biographie !== undefined) authorUpdateData.short_biographie = short_biographie;
    if (email_contact !== undefined) authorUpdateData.email_contact = email_contact;
    if (telephone !== undefined) authorUpdateData.telephone = telephone;
    if (mon_univers_litteraire !== undefined) authorUpdateData.mon_univers_litteraire = mon_univers_litteraire;
    if (mon_parcours !== undefined) authorUpdateData.mon_parcours = mon_parcours;
    if (message_accroche !== undefined) authorUpdateData.message_accroche = message_accroche;
    if (parsedSocials !== undefined) authorUpdateData.social_links = parsedSocials;
    if (req.file) {
      authorUpdateData.photo = adminUpdateData.photo;
      authorUpdateData.photo_public_id = adminUpdateData.photo_public_id;
    }
    authorUpdateData.updated_at = new Date();

    await Author.findOneAndUpdate({}, { $set: authorUpdateData }, { upsert: true, new: true });

    const defaultPhoto = `${req.protocol}://${req.get('host')}/static/images/default_image_actus.png`;
    const profile = {
      _id: updatedAdmin._id,
      email: updatedAdmin.email,
      nom: updatedAdmin.nom || '',
      telephone: updatedAdmin.telephone || '',
      mon_univers_litteraire: updatedAdmin.mon_univers_litteraire || '',
      mon_parcours: updatedAdmin.mon_parcours || '',
      biographie: updatedAdmin.biographie || '',
      short_biographie: updatedAdmin.short_biographie || '',
      email_contact: updatedAdmin.email_contact || '',
      message_accroche: updatedAdmin.message_accroche || '',
      photo: (updatedAdmin.photo && updatedAdmin.photo.length) ? updatedAdmin.photo : defaultPhoto,
      social_links: updatedAdmin.social_links || []
    };

    return res.status(200).json({ status: 'success', admin: profile });
  } catch (err) {
    logger.error({ err }, 'Error updating profile');
    return next(new AppError(500, err.message));
  }
}; 

/**
 * Supprimer la photo du profil (réinitialise à image par défaut)
 * @route DELETE /api/admin/profil/photo
 */
export const deletePhoto = async (req, res, next) => {
  try {
    const profile = await Author.findOne();
    if (!profile || !profile.photo_public_id) {
      return next(new AppError(400, 'Aucune photo à supprimer'));
    }

    try {
      await deleteResource(profile.photo_public_id, { resource_type: 'image' });
    } catch (e) {
      logger.warn({ err: e }, 'Erreur suppression photo sur Cloudinary');
    }

    profile.photo = '';
    profile.photo_public_id = '';
    profile.updated_at = new Date();
    await profile.save();

    const defaultPhoto = `${req.protocol}://${req.get('host')}/static/images/default_image_actus.png`;
    return res.status(200).json({ status: 'success', profile: { ...profile.toObject(), photo: defaultPhoto } });
  } catch (err) {
    logger.error({ err }, 'Error deleting profile photo');
    return next(new AppError(500, err.message));
  }
};

/**
 * Supprimer un réseau social par nom (predifined)
 * @route DELETE /api/admin/profil/socials/:network
 */
export const deleteSocial = async (req, res, next) => {
  try {
    const { network } = req.params;
    if (!ALLOWED_NETWORKS.includes(network)) return next(new AppError(400, 'Réseau social inconnu'));

    const profile = await Author.findOne();
    if (!profile) return next(new AppError(404, 'Profile not found'));

    profile.social_links = (profile.social_links || []).filter(s => s.network !== network);
    profile.updated_at = new Date();
    await profile.save();

    return res.status(200).json({ status: 'success', profile });
  } catch (err) {
    logger.error({ err }, 'Error deleting social link');
    return next(new AppError(500, err.message));
  }
};

export default { getProfile, updateProfile, deletePhoto, deleteSocial };