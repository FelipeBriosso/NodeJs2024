import { Router } from "express";
import * as movieController from "../controllers/movieController";

const router = Router();
router.get("/movies/:keyword?", movieController.getMovies);

export default router;