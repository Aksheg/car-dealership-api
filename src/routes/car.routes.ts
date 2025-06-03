import { Router } from 'express';
import { 
  getCars, 
  getCarById, 
  createCar, 
  updateCar, 
  deleteCar, 
  getCarStats 
} from '../controllers/carController';
import { authenticate, authorize } from '../middleware/auth';
import { validateCar, validateCarUpdate } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', getCars);
router.get('/stats', getCarStats);
router.get('/:id', getCarById);

// Protected routes (managers and admins only)
router.post('/', authenticate, authorize('manager', 'admin'), validateCar, createCar);
router.put('/:id', authenticate, authorize('manager', 'admin'), validateCarUpdate, updateCar);
router.delete('/:id', authenticate, authorize('manager', 'admin'), deleteCar);

export default router;