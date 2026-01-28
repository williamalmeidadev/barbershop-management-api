import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../database/sqlite";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    const { usuario, nome, email, password } = req.body;

    if (!usuario || !nome || !password) {
        return res.status(400).json({ error: "Usuario, nome e senha são obrigatórios." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "E-mail inválido." });
    }

    try {
        db.get(
            `SELECT id FROM admins WHERE email = ?`,
            [usuario],
            async (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro no banco de dados' })
                }

                if (row) {
                    return res.status(409).json({ error: 'Usuário já existe' })
                }

                const saltRounds = 10;
                const passwordHash = await bcrypt.hash(password, saltRounds);

                db.run(
                    `INSERT INTO admins (usuario, nome, email, password_hash) VALUES (?, ?, ?, ?)`,
                    [usuario, nome, email ?? null, passwordHash],
                    function (err) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Erro ao cadastrar administrador'
                            });
                        }

                        return res.status(201).json({
                            message: 'Admin cadastrado com sucesso',
                            adminId: this.lastID
                        })
                    }
                )
            }
        )
    } catch (error) {
        return res.status(500).json({error: 'Erro interno no servidor'})
    }
});

export default router;