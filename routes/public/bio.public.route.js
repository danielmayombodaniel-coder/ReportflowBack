import express from 'express';
import { getBiography } from '../../controllers/public/bio.controller.js';

const router = express.Router();

// GET /api/public/bio
router.get('/bio', getBiography);

// GET /api/public/biographie (alias)
router.get('/biographie', getBiography);

export default router;