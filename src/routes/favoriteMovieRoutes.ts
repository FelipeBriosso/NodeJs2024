import { Router } from 'express';
import * as favoritemovieController from '../controllers/favoriteMovieController';
import { verifyToken }from '../controllers/authMiddleware';

const router = Router();
router.post("/favoritemovies",verifyToken, favoritemovieController.postFavoriteMovie);

export default router;