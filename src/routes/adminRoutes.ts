import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../database/sqlite";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { usuario, nome, email, password } = req.body;

  // 1️⃣ Validação básica
  if (!usuario || !nome || !email || !password) {
    return res.status(400).json({
      error: "Usuário, nome, email e senha são obrigatórios."
    });
  }

  // 2️⃣ Validação de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "E-mail inválido."
    });
  }

  try {
    // 3️⃣ Verificar duplicidade
    db.get(
      `
      SELECT id FROM admins
      WHERE email = ? OR usuario = ?
      `,
      [email, usuario],
      async (err, row) => {
        if (err) {
          return res.status(500).json({
            error: "Erro no banco de dados"
          });
        }

        if (row) {
          return res.status(409).json({
            error: "Admin já existe com esse usuário ou email"
          });
        }

        // 4️⃣ Hash da senha
        const passwordHash = await bcrypt.hash(password, 10);

        // 5️⃣ INSERT COM ativo = 1  ✅
        db.run(
          `
          INSERT INTO admins (usuario, nome, email, password_hash, ativo)
          VALUES (?, ?, ?, ?, 1)
          `,
          [usuario, nome, email, passwordHash],
          function (err) {
            if (err) {
              return res.status(500).json({
                error: "Erro ao cadastrar administrador"
              });
            }

            return res.status(201).json({
              message: "Admin cadastrado com sucesso",
              adminId: this.lastID
            });
          }
        );
      }
    );
  } catch {
    return res.status(500).json({
      error: "Erro interno no servidor"
    });
  }
});

export default router;