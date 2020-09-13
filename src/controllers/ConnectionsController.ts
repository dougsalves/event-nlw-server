import { Request, Response } from 'express'
import db from '../database/connection'

export default class ConnectionsController {
    async index(req: Request, res: Response){
        try {
            const totalConnections = await db('connections').count('id as total')

            const {total} = totalConnections[0]

            return res.status(200).json({total})
        } catch (err) {
            return res.status(400).json({erro:"Falha ao contar conexões."})
        }
    }
    
    async create(req: Request, res: Response){
        const trx = await db.transaction()

        try {
            const user_id = req.body

            await trx('connections').insert(user_id)

            await trx.commit()

            return res.status(201).json({message:"Inclusão com sucesso."})
        } catch(err) {
            await trx.rollback()

            return res.status(400).json({erro:"Falha ao contabilizar conexão."})
        }
    }
}