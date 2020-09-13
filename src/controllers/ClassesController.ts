import {Request, Response} from 'express'
import db from '../database/connection';
import convertHoursToMinute from '../utils/convertHoursToMinute';

interface ScheduleItem {
    week_day: number,
    from: string,
    to: string
}

export default class ClassesController{
    async index(req: Request, res: Response){
        const filters = req.query

        const subject = filters.subject as string
        const week_day = filters.week_day as string
        const time = filters.time as string

        if (!filters.week_day || !filters.subject || !filters.time){
            return res.status(400).json({
                error: 'Filtros para a busca não informados.'
            })
        }

        const timeInMinutes = convertHoursToMinute(time)

        const classes = await db('classes')
            .whereExists(function () {
                this.select('class_schedules.*')
                    .from('class_schedules')
                    .whereRaw('`class_schedules`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedules`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedules`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedules`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject','=',subject)
            .join('users','classes.user_id','=','users.id')
            .select(['classes.*', 'users.*'])

        res.json(classes)
    }

    async create(req: Request, res: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject, 
            cost, 
            schedules
        } = req.body

        const trx = await db.transaction()

        try {
            const insertedUsersId = await trx('users').insert({
                name, avatar, whatsapp, bio
            })

            const user_id = insertedUsersId[0]

            const insertedClassesIds = await trx('classes').insert({
                subject, cost, user_id
            })

            const class_id = insertedClassesIds[0]

            const classSchedules = schedules.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHoursToMinute(scheduleItem.from),
                    to: convertHoursToMinute(scheduleItem.to)
                }
            })

            await trx('class_schedules').insert(classSchedules)

            await trx.commit()

            return res.status(201).json({ message: 'Cadastro com Sucesso!'})
        } catch(err) {
            await trx.rollback()

            return res.status(400).json({ message: 'Erro ao cadastro novo Professor.' })
        }
    }
}