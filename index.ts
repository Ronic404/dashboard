import express, { Request, Response, NextFunction } from 'express'
import { router as userRouter } from './users/users.js'

const port = 8000
const app = express()

app.use((req, res, next) => {
  console.log('Время ', Date.now())
  next()
})

app.get('/hello', (req, res) => {
  // res.send('Привет!')
  throw new Error('Error')
})

app.use('/users', userRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.log(err.message)
  res.status(500).send(err.message)
})

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`)
})
