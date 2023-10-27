import { Container, ContainerModule, interfaces } from 'inversify'

import { App } from './app'
import { LoggerService } from './logger/logger.service'
import { ExeptionFilter } from './errors/exeption.filter'
import { UsersController } from './users/users.controller'

import { ILogger } from './logger/logger.interface'
import { IExeptionFilter } from './errors/exeption.filter.interface'
import { IUsersController } from './users/users.controller.interface'

import { TYPES } from './types'

export interface IBootstrapReturn {
	app: App
	appContainer: Container
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService)
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter)
	bind<IUsersController>(TYPES.UsersController).to(UsersController)
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
