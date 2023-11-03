import { Container } from 'inversify'
import { UserModel } from '@prisma/client'
import 'reflect-metadata'

import { IUsersService } from './users.service.interface'
import { IConfigService } from '../config/config.service.interface'
import { IUsersRepository } from './users.repository.interface'

import { User } from './user.entity'
import { UsersService } from './users.service'

import { TYPES } from '../types'

const ConfigServiceMock: IConfigService = {
	get: jest.fn(),
}

const UsersRepositoryMock: IUsersRepository = {
	find: jest.fn(),
	create: jest.fn(),
}

const container = new Container()
let usersService: IUsersService
let configService: IConfigService
let usersRepository: IUsersRepository

let createdUser: UserModel | null

beforeAll(() => {
	container.bind<IUsersService>(TYPES.UsersService).to(UsersService)
	container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock)
	container.bind<IUsersRepository>(TYPES.UsersRepository).toConstantValue(UsersRepositoryMock)

	usersService = container.get<IUsersService>(TYPES.UsersService)
	configService = container.get<IConfigService>(TYPES.ConfigService)
	usersRepository = container.get<IUsersRepository>(TYPES.UsersRepository)
})

describe('User service', () => {
	it('createUser', async () => {
		configService.get = jest.fn().mockReturnValueOnce('1')
		usersRepository.create = jest.fn().mockImplementationOnce(
			(user: User): UserModel => ({
				name: user.name,
				email: user.email,
				password: user.password,
				id: 1,
			}),
		)
		createdUser = await usersService.createUser({
			email: 'a@a.ru',
			name: 'Антон',
			password: '1',
		})
		expect(createdUser?.id).toEqual(1)
		expect(createdUser?.password).not.toEqual('1')
	})

	it('validateUser - success', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser)
		const result = await usersService.validateUser({
			email: 'a@a.ru',
			password: '1',
		})
		expect(result).toBeTruthy()
	})

	it('validateUser - wrong password', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser)
		const result = await usersService.validateUser({
			email: 'a@a.ru',
			password: '2',
		})
		expect(result).toBeFalsy()
	})

	it('validateUser - wrong user', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(null)
		const result = await usersService.validateUser({
			email: 'a2@a.ru',
			password: '2',
		})
		expect(result).toBeFalsy()
	})
})
