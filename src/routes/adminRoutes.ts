import { Router } from "express";
import { adminsController } from "../controllers/adminsController";

const router = Router();

router.post("/", adminsController.criar);

export default router;
