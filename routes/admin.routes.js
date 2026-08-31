import express from 'express';
import { checkSetup } from '../controllers/admin/check-setup.admin.controller.js';
import { setupAdmin } from '../controllers/admin/setup.admin.controller.js';
import { loginAdmin } from '../controllers/admin/login.admin.controller.js';
import { authenticateAdmin } from '../middlewares/auth.admin.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/check-setup', checkSetup);
router.post('/setup', setupAdmin);
router.post('/login', loginAdmin);

// Routes protégées (exemple pour tester l'auth)
router.get('/profile', authenticateAdmin, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      admin: {
        id: req.admin._id,
        email: req.admin.email
      }
    }
  });
});

export default router;