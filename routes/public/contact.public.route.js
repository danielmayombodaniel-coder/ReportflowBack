import express from 'express';
import { sendContactMessage, getContactInfo } from '../../controllers/public/contact.controller.js';
import { contactValidationRules, validate } from '../../middlewares/validator.js';

const router = express.Router();

// GET /api/public/getcontact
router.get('/getcontact', getContactInfo);

// POST /api/public/contact
router.post('/contact', contactValidationRules(), validate, sendContactMessage);

export default router;