import express from 'express';
import { getMessages, getMessage, updateMessageStatus, deleteMessage, getUnreadCount } from '../../controllers/admin/messages.admin.controller.js';
import { requireAdminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/messages/unread/count', requireAdminAuth, getUnreadCount);
router.get('/messages', requireAdminAuth, getMessages);
router.get('/messages/:id', requireAdminAuth, getMessage);
router.put('/messages/:id/status', requireAdminAuth, updateMessageStatus);
router.delete('/messages/:id', requireAdminAuth, deleteMessage);

export default router;   