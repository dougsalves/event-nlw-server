import express from 'express'
import routes from './routes'
import cors from 'cors'

const porta = 3333
const corsOptions = {
    origin: ['http://192.168.1.108:3000', 'http://localhost:3000'],
    optionsSuccessStatus: 200
}

const app = express()
app.use(cors(corsOptions))

app.use(express.json())
app.use(routes)

app.listen(porta, (req, res) => {
    console.log(`Servidor rodando na porta ${porta}`)
})