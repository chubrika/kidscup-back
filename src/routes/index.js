import { Router } from 'express';
import authRoutes from './authRoutes.js';
import teamRoutes from './teamRoutes.js';
import playerRoutes from './playerRoutes.js';
import matchRoutes from './matchRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import standingsRoutes from './standingsRoutes.js';
import seasonRoutes from './seasonRoutes.js';
import newsRoutes from './newsRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/teams', teamRoutes);
router.use('/players', playerRoutes);
router.use('/matches', matchRoutes);
router.use('/categories', categoryRoutes);
router.use('/seasons', seasonRoutes);
router.use('/news', newsRoutes);
router.use('/standings', standingsRoutes);
router.use('/', uploadRoutes);

export default router;
