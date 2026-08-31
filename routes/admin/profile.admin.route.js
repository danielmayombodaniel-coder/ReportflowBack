import express from 'express';
import { requireAdminAuth } from '../../middlewares/auth.js';
import { getProfile, updateProfile, deletePhoto, deleteSocial } from '../../controllers/admin/profile.admin.controller.js';
import { updateProfileValidationRules, validate } from '../../middlewares/validator.js';
import { uploadSingleImage } from '../../middlewares/upload.js';

const router = express.Router();

router.get('/profile', requireAdminAuth, getProfile);
router.put('/profile', requireAdminAuth, uploadSingleImage, updateProfileValidationRules(), validate, updateProfile);
router.delete('/profile/photo', requireAdminAuth, deletePhoto);
router.delete('/profile/socials/:network', requireAdminAuth, deleteSocial);

export default router;