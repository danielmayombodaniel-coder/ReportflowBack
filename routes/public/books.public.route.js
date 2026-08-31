import express from 'express';
import { downloadBook, getAllBooks, getBookById } from '../../controllers/public/books.controller.js';
import { bookIdValidationRules, validate } from '../../middlewares/validator.js';

const router = express.Router();

// GET /api/public/books - Liste tous les livres
router.get('/books', getAllBooks);

// GET /api/public/books/:id - Détails d'un livre
router.get('/books/:id', bookIdValidationRules(), validate, getBookById);

// GET /api/public/livres/:id/telecharger
router.get('/livres/:id/telecharger', bookIdValidationRules(), validate, downloadBook);

export default router;