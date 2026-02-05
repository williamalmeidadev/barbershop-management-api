import { Router } from "express";
import { verifyToken } from '../middlewares/verifyToken'
import { createRateLimiter } from '../middlewares/rateLimiter'
import { clientesController } from "../controllers/clientesController";

const router = Router();

const registerLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
  keyPrefix: 'register:',
  keyGenerator: (req) => {
    const email = String((req.body?.email || '')).toLowerCase().trim()
    const xff = req.headers['x-forwarded-for']
    const ip = Array.isArray(xff) ? xff[0] : xff?.split(',')[0]?.trim()
    const addr = ip || req.ip || req.socket.remoteAddress || 'unknown'
    return email ? `${addr}:${email}` : addr
  }
})

router.post("/", registerLimiter, clientesController.criar);
router.post("/register", registerLimiter, clientesController.criar);
router.get("/me", verifyToken, clientesController.getMe);
router.put("/me", verifyToken, clientesController.updateMe);
router.delete("/me", verifyToken, clientesController.deleteMe);

export default router;
