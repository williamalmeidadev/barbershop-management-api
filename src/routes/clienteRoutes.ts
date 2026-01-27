import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../database/sqlite";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    const { nome, email, telefone, password } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "E-mail inválido." });
    }

    try {
        db.get(
            `SELECT id FROM clientes WHERE email = ?`,
            [email],
            async (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro no banco de dados.' });
                }

                if (row) {
                    return res.status(409).json({ error: 'E-mail já cadastrado.' });
                }

                const saltRounds = 10;
                const passwordHash = await bcrypt.hash(password, saltRounds);

                db.run(`
                    INSERT INTO clientes (nome, email, telefone, password_hash) VALUES (?, ?, ?, ?)
                `,
                    [nome, email, telefone ?? null, passwordHash],
                    function (err) {
                        if (err) {
                            return res.status(500).json({
                                error: ' Erro ao cadastrar cliente'
                            });
                        }
                        return res.status(201).json({
                            message: 'Cliente cadastrado com sucesso',
                            clienteId: this.lastID
                        })
                    }
                )
            }
        )
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

export default router;