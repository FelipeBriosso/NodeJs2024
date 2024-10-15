import { Router } from "express";
import * as userController from "../controllers/userController";

const router = Router();
router.post("/signUp", userController.register);
router.post("/signIn", userController.login);

export default router;