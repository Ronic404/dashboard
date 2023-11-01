import { Container, ContainerModule, interfaces } from 'inversify'

import { App } from './app'
import { UsersService } from './users/users.service'
import { ConfigService } from './config/config.service'
import { LoggerService } from './logger/logger.service'
import { PrismaService } from './database/prisma.service'
import { ExeptionFilter } from './errors/exeption.filter'
import { UsersController } from './users/users.controller'
import { UsersRepository } from './users/users.repository'

import { ILogger } from './logger/logger.interface'
import { IUsersService } from './users/users.service.interface'
import { IConfigService } from './config/config.service.interface'
import { IExeptionFilter } from './errors/exeption.filter.interface'
import { IUsersController } from './users/users.controller.interface'
import { IUsersRepository } from './users/users.repository.interface'

import { TYPES } from './types'

export interface IBootstrapReturn {
	app: App
	appContainer: Container
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope()
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter)
	bind<IUsersService>(TYPES.UsersService).to(UsersService)
	bind<IUsersController>(TYPES.UsersController).to(UsersController)
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope()
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope()
	bind<IUsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope()
	bind<App>(TYPES.Application).to(App)
})

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container()
	appContainer.load(appBindings)
	const app = appContainer.get<App>(TYPES.Application)
	app.init()
	return { app, appContainer }
}

export const { app, appContainer } = bootstrap()
