import request from 'supertest'

import { App } from '../src/app'
import { boot } from '../src/main'

let application: App

beforeAll(async () => {
	const { app } = await boot
	application = app
})

describe('Users e2e', () => {
	it('Register - error', async () => {
		const result = request(application.app)
			.post('/users/register')
			.send({ email: 'a@a.ru', password: '1' })
		expect((await result).statusCode).toBe(422)
	})

	it('Login - success', async () => {
		const result = request(application.app)
			.post('/users/login')
			.send({ email: 'a@a.ru', password: 'asdads' })
		expect((await result).body.jwt).not.toBeUndefined()
	})

	it('Login - error', async () => {
		const result = request(application.app)
			.post('/users/login')
			.send({ email: 'a@a.ru', password: '1' })
		expect((await result).statusCode).toBe(401)
	})

	it('Info - success', async () => {
		const login = request(application.app)
			.post('/users/login')
			.send({ email: 'a@a.ru', password: 'asdads' })
		const result = request(application.app)
			.get('/users/info')
			.set('Authorization', `Bearer ${(await login).body.jwt}`)
		expect((await result).body.email).toBe('a@a.ru')
	})

	it('Info - error', async () => {
		const result = request(application.app).get('/users/info').set('Authorization', 'Bearer 1')
		expect((await result).statusCode).toBe(401)
	})
})

afterAll(() => {
	application.close()
})
