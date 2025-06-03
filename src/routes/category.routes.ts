import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validateCategory, validateCategoryUpdate } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Protected routes (managers and admins only)
router.post('/', authenticate, authorize('manager', 'admin'), validateCategory, CategoryController.createCategory);
router.put('/:id', authenticate, authorize('manager', 'admin'), validateCategoryUpdate, CategoryController.updateCategory);
router.delete('/:id', authenticate, authorize('manager', 'admin'), CategoryController.deleteCategory);

export default router;