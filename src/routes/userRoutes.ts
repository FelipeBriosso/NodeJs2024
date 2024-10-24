import { Router } from "express";
import * as userController from "../controllers/userController";

const router = Router();
router.post("/signup", userController.register);
router.post("/signin", userController.login);
router.post("/logout", userController.logout);

export default router;