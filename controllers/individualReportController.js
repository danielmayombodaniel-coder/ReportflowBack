import IndividualReport from '../models/IndividualReport.js';
import { individualReportSchema } from '../validators/reportValidators.js';
import { createReportController } from '../services/reportControllerFactory.js';

const controller = createReportController({
    Model: IndividualReport,
    schema: individualReportSchema,
    empty: {
        title: '',
        activitesRealisees: '',
        tachesEffectuees: '',
        problemesRencontres: '',
        observations: '',
        autresInformations: '',
    },
    meaningfulFields: ['title', 'activitesRealisees', 'tachesEffectuees', 'problemesRencontres', 'observations', 'autresInformations'],
    allowedProfiles: ['rapport_individuel'],
});

export const getToday = controller.getToday;
export const updateToday = controller.updateToday;
export const submitToday = controller.submitToday;
