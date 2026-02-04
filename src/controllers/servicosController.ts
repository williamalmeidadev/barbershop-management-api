import { Request, Response } from 'express'
import { servicoService } from '../services/servicosService'
import fs from 'fs'
import path from 'path'

export const servicosController = {
  async criar(req: Request, res: Response) {
    try {
      const servico = await servicoService.criar(req.body)
      res.status(201).json(servico)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const ativoParam = req.query.ativo
      const ativo = ativoParam !== undefined ? Number(ativoParam) : undefined
      const barbeiroParam = req.query.barbeiro_id ?? req.query.barbeiroId
      const barbeiroId = barbeiroParam !== undefined ? Number(barbeiroParam) : undefined
      const servicos = await servicoService.listar(ativo, barbeiroId)
      res.json(servicos)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const servico = await servicoService.buscarPorId(Number(req.params.id))
      res.json(servico)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const servico = await servicoService.atualizar(Number(req.params.id), req.body)
      res.json(servico)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async desativar(req: Request, res: Response) {
    try {
      const servico = await servicoService.desativar(Number(req.params.id))
      res.json(servico)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async apagarPermanente(req: Request, res: Response) {
    try {
      await servicoService.apagarPermanente(Number(req.params.id))
      res.status(204).send()
    } catch (err: any) {
      const message = err?.message || 'Erro ao apagar serviço.'
      const status = message.includes('não encontrado') ? 404 : message.includes('vinculados') || message.includes('vínculos') ? 409 : 400
      res.status(status).json({ error: message })
    }
  },

  async uploadFoto(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const arquivo = req.file

      if (!id) {
        return res.status(400).json({ error: 'ID do serviço é obrigatório' })
      }

      if (!arquivo) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' })
      }

      const servicoAntigo = await servicoService.buscarPorId(id)

      if (servicoAntigo?.foto_url) {
        try {
          const nomeArquivoAntigo = servicoAntigo.foto_url.split('/assets/images/')[1]
          if (nomeArquivoAntigo) {
            const caminhoArquivoAntigo = path.resolve(__dirname, '..', '..', 'public', 'assets', 'images', nomeArquivoAntigo)
            if (fs.existsSync(caminhoArquivoAntigo)) {
              await fs.promises.unlink(caminhoArquivoAntigo)
            }
          }
        } catch (err) {
          console.error('Erro ao deletar foto antiga:', err)
        }
      }

      const forwardedPrefix = req.headers['x-forwarded-prefix']
      const basePath =
        process.env.BASE_PATH ||
        (typeof forwardedPrefix === 'string' && forwardedPrefix) ||
        (Array.isArray(forwardedPrefix) && forwardedPrefix[0]) ||
        ''
      const normalizedBase = basePath && basePath.includes('/server08') ? '/server08' : ''
      const fotoUrl = `${normalizedBase}/assets/images/${arquivo.filename}`

      const servicoAtualizado = await servicoService.atualizar(id, { foto_url: fotoUrl })
      return res.json(servicoAtualizado)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  },

  async removerFoto(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (!id) {
        return res.status(400).json({ error: 'ID do serviço é obrigatório' })
      }

      const servicoAntigo = await servicoService.buscarPorId(id)
      if (servicoAntigo?.foto_url) {
        try {
          const nomeArquivoAntigo = servicoAntigo.foto_url.split('/assets/images/')[1]
          if (nomeArquivoAntigo) {
            const caminhoArquivoAntigo = path.resolve(__dirname, '..', '..', 'public', 'assets', 'images', nomeArquivoAntigo)
            if (fs.existsSync(caminhoArquivoAntigo)) {
              await fs.promises.unlink(caminhoArquivoAntigo)
            }
          }
        } catch (err) {
          console.error('Erro ao deletar foto antiga:', err)
        }
      }

      const servicoAtualizado = await servicoService.atualizar(id, { foto_url: null })
      return res.json(servicoAtualizado)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }
}
