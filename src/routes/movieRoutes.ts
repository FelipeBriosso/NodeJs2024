import { Router } from 'express';
import * as movieController from '../controllers/movieController';
import { verifyToken }from '../controllers/authMiddleware';

const router = Router();
router.get("/movies/:keyword?",verifyToken, movieController.getMovies);

export default router;