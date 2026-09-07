import express from 'express';
import { generateUnifiedReportForDate } from '../controllers/unifiedReportController.js';

const router = express.Router();

/**
 * Route PUBLIQUE pour générer et télécharger le rapport unifié
 * GET /api/rapport-unifie?date=YYYY-MM-DD
 * 
 * Cette route est accessible sans authentification
 * Si la date n'est pas fournie, utilise aujourd'hui par défaut
 */
router.get('/', generateUnifiedReportForDate);

export default router;
