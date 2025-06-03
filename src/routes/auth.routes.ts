import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateAccountUpdate, validateProfileUpdate, validateUser } from '../middleware/validation';

const router = Router();

router.post('/register', validateUser, AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validateProfileUpdate, AuthController.updateProfile);
router.put('/profile/account', authenticate, validateAccountUpdate, AuthController.updateAccount);

export default router;