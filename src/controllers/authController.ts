import { Request, Response } from "express";
import { loginService } from "../services/loginService";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: "Email (ou usuário) e senha são obrigatórios."
        });
      }

      const admin = await loginService.loginAdmin({ email, password }).catch(() => null);
      if (admin) {
        return res.json({ token: admin.token, role: 'admin' });
      }

      const cliente = await loginService.loginCliente({ email, password }).catch(() => null);
      if (cliente) {
        return res.json({ token: cliente.token, role: 'cliente' });
      }

      return res.status(401).json({ error: "Credenciais inválidas." });
    } catch (err: any) {
      const status = err.message?.includes('inativo') ? 403 : err.message?.includes('Credenciais') ? 401 : 400;
      return res.status(status).json({ error: err.message });
    }
  }
}
