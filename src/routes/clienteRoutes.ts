import { Router } from "express";
import { clientesController } from "../controllers/clientesController";

const router = Router();

router.post("/", clientesController.criar);
router.post("/register", clientesController.criar);

export default router;
