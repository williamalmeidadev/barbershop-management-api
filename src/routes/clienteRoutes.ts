import { Router } from "express";
import { verifyToken } from '../middlewares/verifyToken'
import { clientesController } from "../controllers/clientesController";

const router = Router();

router.post("/", clientesController.criar);
router.post("/register", clientesController.criar);
router.get("/me", verifyToken, clientesController.me);

export default router;
