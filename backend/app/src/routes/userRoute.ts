import { Router } from 'express';
import { createUser, deleteUser } from '../controllers/userController.js';

const router = Router();

router.post('/', createUser);
router.delete('/:username', deleteUser);

export default router;
