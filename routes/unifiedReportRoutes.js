import express from 'express';
import { generateUnifiedReportForDate, getUnifiedReportData } from '../controllers/unifiedReportController.js';

const router = express.Router();

/**
 * Route PUBLIQUE pour générer et télécharger le rapport unifié
 * GET /api/rapport-unifie?date=YYYY-MM-DD
 * 
 * Cette route est accessible sans authentification
 * Si la date n'est pas fournie, utilise aujourd'hui par défaut
 */
router.get('/', generateUnifiedReportForDate);

/**
 * Route PUBLIQUE pour récupérer les données JSON du rapport unifié
 * GET /api/rapport-unifie/data?date=YYYY-MM-DD
 * 
 * Cette route est accessible sans authentification
 * Retourne les données structurées pour affichage dans l'interface
 */
router.get('/data', getUnifiedReportData);

export default router;
