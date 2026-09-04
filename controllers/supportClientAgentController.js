import SupportClientReport from '../models/SupportClientReport.js';
import { supportClientReportSchema } from '../validators/reportValidators.js';
import { createReportController } from '../services/reportControllerFactory.js';

const controller = createReportController({
    Model: SupportClientReport,
    schema: supportClientReportSchema,
    empty: {
        mails: {
            demandesSouscription: 0,
            questionsDiverses: 0,
            mailsTraites: 0,
            dossiersEnAttenteRegularisation: 0,
        },
        dossiers: { assignes: 0, enCours: 0, saisis: 0 },
        defisRencontres: '',
        observations: '',
    },
    meaningfulFields: ['mails', 'dossiers', 'defisRencontres', 'observations'],
    allowedProfiles: ['support_client_agent'],
});

export const getToday = controller.getToday;
export const updateToday = controller.updateToday;
export const submitToday = controller.submitToday;
