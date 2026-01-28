import { Request, Response } from "express";
import { db } from "../database/sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "minha_chave_secreta_super_segura";

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email (ou usuário) e senha são obrigatórios."
      });
    }

    const query = `
      SELECT id, email, password_hash, 'ADMIN' AS role
      FROM admins
      WHERE (email = ? OR usuario = ?) AND ativo = 1

      UNION

      SELECT id, email, password_hash, 'CLIENT' AS role
      FROM clientes
      WHERE email = ? AND ativo = 1

      LIMIT 1
    `;

    db.get(query, [email, email, email], async (err, user: any) => {
      if (err) {
        return res.status(500).json({
          error: "Erro interno no servidor."
        });
      }

      if (!user) {
        return res.status(401).json({
          error: "Credenciais inválidas."
        });
      }

      const passwordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!passwordValid) {
        return res.status(401).json({
          error: "Credenciais inválidas."
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        SECRET_KEY,
        { expiresIn: "1d" }
      );

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token
      });
    });
  }
}