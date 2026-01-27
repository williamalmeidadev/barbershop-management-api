import { Request, Response } from 'express';
import { db } from '../database/sqlite';

export class BookingController {
  async enroll(req: Request, res: Response) {
    const { id } = req.params; 
    const { cliente_id } = req.body; 

    // Verify if the slot is still available
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
}