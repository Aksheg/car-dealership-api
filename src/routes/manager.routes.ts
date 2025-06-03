import { Router } from 'express';
import { ManagerController } from '../controllers/managerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protected routes (admins only)
router.get('/', authenticate, authorize('admin'), ManagerController.getAllManagers);
router.get('/stats', authenticate, authorize('admin'), ManagerController.getManagerStats);
router.get('/:id', authenticate, authorize('admin'), ManagerController.getManagerById);
router.post('/', authenticate, authorize('admin'), ManagerController.createManager);
router.put('/:id', authenticate, authorize('admin'), ManagerController.updateManager);
router.delete('/:id', authenticate, authorize('admin'), ManagerController.deleteManager);

export default router;