import { Request, Response } from 'express'
import { barbeirosService } from '../services/barbeirosService'
import fs from 'fs'
import path from 'path'

export const barbeirosController = {
  async criar(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.criar(req.body)
      res.status(201).json(barbeiro)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const ativoParam = req.query.ativo
      const ativo = ativoParam !== undefined ? Number(ativoParam) : undefined
      const barbeiros = await barbeirosService.listar(ativo)
      res.json(barbeiros)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.buscarPorId(Number(req.params.id))
      res.json(barbeiro)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.atualizar(Number(req.params.id), req.body)
      res.json(barbeiro)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async desativar(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.desativar(Number(req.params.id))
      res.json(barbeiro)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async uploadFoto(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const arquivo = req.file

      if (!id) {
        return res.status(400).json({ error: 'ID do barbeiro é obrigatório' })
      }

      if (!arquivo) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' })
      }

      // Search for existing barber
      const barbeiroAntigo = await barbeirosService.buscarPorId(id)

      // If there is an old photo, delete it from the server
      if (barbeiroAntigo && barbeiroAntigo.foto_url) {
        try {
          // Extract file name from URL
          const nomeArquivoAntigo = barbeiroAntigo.foto_url.split('/images/')[1]
          
          if (nomeArquivoAntigo) {
            const caminhoArquivoAntigo = path.resolve(__dirname, '..', '..', 'public', 'images', nomeArquivoAntigo)
            if (fs.existsSync(caminhoArquivoAntigo)) {
              await fs.promises.unlink(caminhoArquivoAntigo)
            }
          }
        } catch (err) {
          console.error('Erro ao deletar foto antiga:', err)
        }
      }

      // Save new photo URL
      const fotoUrl = `${req.protocol}://${req.get('host')}/images/${arquivo.filename}`

      const barbeiroAtualizado = await barbeirosService.atualizar(id, {
        foto_url: fotoUrl
      })

      return res.json(barbeiroAtualizado)
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
        return res.status(400).json({ error: 'ID do barbeiro é obrigatório' })
      }

      const barbeiroAntigo = await barbeirosService.buscarPorId(id)

      if (barbeiroAntigo?.foto_url) {
        try {
          const nomeArquivoAntigo = barbeiroAntigo.foto_url.split('/images/')[1]
          if (nomeArquivoAntigo) {
            const caminhoArquivoAntigo = path.resolve(__dirname, '..', '..', 'public', 'images', nomeArquivoAntigo)
            if (fs.existsSync(caminhoArquivoAntigo)) {
              await fs.promises.unlink(caminhoArquivoAntigo)
            }
          }
        } catch (err) {
          console.error('Erro ao deletar foto antiga:', err)
        }
      }

      const barbeiroAtualizado = await barbeirosService.atualizar(id, {
        foto_url: null
      })

      return res.json(barbeiroAtualizado)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }
}
