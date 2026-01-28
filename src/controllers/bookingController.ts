import { Request, Response } from 'express';
import { db } from '../database/sqlite';

export class BookingController {
  async enroll(req: Request, res: Response) {
    const { id } = req.params; 
    const { cliente_id } = req.body; 

    db.get('SELECT * FROM vagas WHERE id = ?', [id], (err, vaga: any) => {
      if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
      if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });
      
      if (vaga.status !== 'DISPONIVEL') {
        return res.status(400).json({ error: 'Este horário não está mais disponível.' });
      }

      const queryAgendamento = `
        INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status)
        VALUES (?, ?, ?, ?, 'AGENDADO')
      `;

      db.run(queryAgendamento, [cliente_id, vaga.barbeiro_id, vaga.inicio, vaga.fim], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar agendamento' });

        const agendamentoId = this.lastID;

        db.run(`UPDATE vagas SET status = 'RESERVADO' WHERE id = ?`, [id], (err) => {
          if (err) console.error('Erro ao atualizar status da vaga', err);
        });

        return res.status(201).json({ 
          message: 'Inscrição/Agendamento realizado com sucesso!',
          bookingId: agendamentoId
        });
      });
    });
  }
  async cancel(req: Request, res: Response) {
    const { id } = req.params;
    const { cliente_id } = req.body;

    db.get('SELECT * FROM vagas WHERE id = ?', [id], (err, vaga: any) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar vaga' });
      if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });

      if (vaga.status !== 'RESERVADO') {
        return res.status(400).json({ error: 'Esta vaga não está reservada ou já está livre.' });
      }

      const queryAgendamento = `
        SELECT * FROM agendamentos 
        WHERE barbeiro_id = ? AND inicio = ? AND status = 'AGENDADO'
      `;

      db.get(queryAgendamento, [vaga.barbeiro_id, vaga.inicio], (err, agendamento: any) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar agendamento' });
        if (!agendamento) return res.status(404).json({ error: 'Agendamento ativo não encontrado para esta vaga.' });

        if (cliente_id && agendamento.cliente_id !== cliente_id) {
          return res.status(403).json({ error: 'Você não tem permissão para cancelar este agendamento.' });
        }

        db.run(`UPDATE agendamentos SET status = 'CANCELADO' WHERE id = ?`, [agendamento.id], (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao cancelar agendamento' });

            db.run(`UPDATE vagas SET status = 'DISPONIVEL' WHERE id = ?`, [id]);
            
            return res.status(200).json({ message: 'Inscrição cancelada e vaga liberada com sucesso!' });
        });
      });
    });
  }
  async myActivities(req: Request, res: Response) {
    const { cliente_id } = req.query;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id é obrigatório' });
    }

    const query = `
      SELECT
      a.id,
      a.inicio,
      a.fim,
      a.status,
      b.nome_profissional as barbeiro
    FROM agendamentos a
    JOIN barbeiros b ON a.barbeiro_id = b.id
    WHERE a.cliente_id = ?
    ORDER BY a.inicio DESC
    `;

    db.all(query, [cliente_id], (err, rows) => {
      if (err){
         return res.status(500).json({ error: 'Erro ao buscar atividades' });
      }
      return res.json(rows);
    });
  }
}