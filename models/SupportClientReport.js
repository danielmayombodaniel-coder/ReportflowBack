import mongoose from 'mongoose';
import {
    configureBaseReportSchema,
    createBaseReportDefinition,
} from './baseReportSchema.js';

/**
 * Mongoose schema for a Support Client daily report.
 */
const supportClientReportSchema = configureBaseReportSchema(new mongoose.Schema({
    ...createBaseReportDefinition(),
    mails: {
        demandesSouscription: { type: Number, min: 0, default: 0 },
        questionsDiverses: { type: Number, min: 0, default: 0 },
        mailsTraites: { type: Number, min: 0, default: 0 },
        dossiersEnAttenteRegularisation: { type: Number, min: 0, default: 0 },
    },
    dossiers: {
        assignes: { type: Number, min: 0, default: 0 },
        enCours: { type: Number, min: 0, default: 0 },
        saisis: { type: Number, min: 0, default: 0 },
    },
    defisRencontres: { type: String, trim: true },
    observations: { type: String, trim: true }, // Champ existant pour les agents (sera caché dans le formulaire)
    observationsResponsable: { type: String, trim: true }, // Nouveau champ spécifique au responsable
}));

const SupportClientReport = mongoose.model(
    'SupportClientReport',
    supportClientReportSchema
);

export default SupportClientReport;
