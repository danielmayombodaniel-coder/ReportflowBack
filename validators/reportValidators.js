import { z } from 'zod';
import { ERROR_CATEGORIES } from '../utils/errorCategories.js';

const optionalText = z.string().trim().optional();
const nonNegativeNumber = z.number().finite().min(0, 'La valeur doit être supérieure ou égale à 0');
const submittedByName = z.string().trim().min(1, 'Le nom du soumetteur est requis').optional();

const frequentError = z.object({
    category: z.enum(ERROR_CATEGORIES),
    customCategory: optionalText,
    dossiers: z.array(z.string().trim()).default([]),
}).superRefine((value, context) => {
    if (value.category === 'autre' && !value.customCategory) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['customCategory'], message: 'Précisez la catégorie autre' });
    }
});

export const supportClientReportSchema = z.object({
    submittedByName,
    mails: z.object({
        demandesSouscription: nonNegativeNumber.optional(),
        questionsDiverses: nonNegativeNumber.optional(),
        mailsTraites: nonNegativeNumber.optional(),
        dossiersEnAttenteRegularisation: nonNegativeNumber.optional(),
    }).optional(),
    dossiers: z.object({
        assignes: nonNegativeNumber.optional(),
        enCours: nonNegativeNumber.optional(),
        saisis: nonNegativeNumber.optional(),
    }).optional(),
    defisRencontres: optionalText,
    observations: optionalText,
}).strict();

export const controllerReportSchema = z.object({
    submittedByName,
    dossiersAssignes: nonNegativeNumber.optional(),
    dossiersControles: nonNegativeNumber.optional(),
    dossiersEnAttente: nonNegativeNumber.optional(),
    remarques: optionalText,
    dataEntryPersons: z.array(z.object({ nom: z.string().trim().min(1), zone: z.string().trim().min(1) })).optional(),
    frequentErrors: z.array(frequentError).optional(),
}).strict();

export const dataEntryOperatorReportSchema = z.object({
    submittedByName,
    dossiersRecus: nonNegativeNumber.optional(),
    dossiersTraites: nonNegativeNumber.optional(),
    dossiersRestants: nonNegativeNumber.optional(),
    observations: optionalText,
}).strict();

export const individualReportSchema = z.object({
    submittedByName,
    title: z.string().trim().min(1, 'Le titre ne peut pas être vide'),
    activitesRealisees: optionalText,
    tachesEffectuees: optionalText,
    problemesRencontres: optionalText,
    observations: optionalText,
    autresInformations: optionalText,
}).strict();
