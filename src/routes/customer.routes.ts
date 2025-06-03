import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protected routes (managers and admins only)
router.get('/', authenticate, authorize('manager', 'admin'), CustomerController.getAllCustomers);
router.get('/stats', authenticate, authorize('manager', 'admin'), CustomerController.getCustomerStats);
router.get('/:id', authenticate, authorize('manager', 'admin'), CustomerController.getCustomerById);
router.put('/:id', authenticate, authorize('manager', 'admin'), CustomerController.updateCustomer);
router.delete('/:id', authenticate, authorize('admin'), CustomerController.deleteCustomer);
router.post('/:id/purchase', authenticate, authorize('manager', 'admin'), CustomerController.addCarToPurchaseHistory);

export default router;