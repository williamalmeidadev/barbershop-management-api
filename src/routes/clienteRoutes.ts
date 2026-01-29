import { Router } from "express";
import { clientesController } from "../controllers/clientesController";

const router = Router();

router.post("/", clientesController.criar);

export default router;
