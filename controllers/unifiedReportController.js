import { buildReportDataForDate } from '../services/unifiedReportDataBuilder.js';
import { generateUnifiedReport } from '../services/unifiedReportGenerator.js';

/**
 * Génère et télécharge le rapport unifié pour une date donnée
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const generateUnifiedReportForDate = async (req, res) => {
    try {
        const { date } = req.query;
        
        // Construire les données pour la date demandée
        const reportData = await buildReportDataForDate(date);
        
        // Générer le document Word
        const docxBuffer = await generateUnifiedReport(reportData);
        
        // Formater le nom du fichier avec la date
        const dateForFilename = date || new Date().toISOString().slice(0, 10);
        const filename = `rapport-unifie-${dateForFilename}.docx`;
        
        // Envoyer le fichier en téléchargement
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(docxBuffer);
        
    } catch (error) {
        console.error('Erreur lors de la génération du rapport unifié:', error);
        
        // Gérer les erreurs de validation de date
        if (error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        
        // Gérer les autres erreurs
        res.status(500).json({ 
            error: 'Erreur lors de la génération du rapport unifié',
            message: error.message 
        });
    }
};

/**
 * Récupère les données JSON du rapport unifié pour une date donnée
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const getUnifiedReportData = async (req, res) => {
    try {
        const { date } = req.query;
        
        // Construire les données pour la date demandée
        const reportData = await buildReportDataForDate(date);
        
        // Retourner les données en JSON
        res.json(reportData);
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données du rapport unifié:', error);
        
        // Gérer les erreurs de validation de date
        if (error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        
        // Gérer les autres erreurs
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données du rapport unifié',
            message: error.message 
        });
    }
};

export default { generateUnifiedReportForDate, getUnifiedReportData };
