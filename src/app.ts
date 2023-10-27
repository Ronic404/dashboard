import { Server } from 'http'
import express, { Express } from 'express'
import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { UsersController } from './users/users.controller'

import { ILogger } from './logger/logger.interface.js'
import { IExeptionFilter } from './errors/exeption.filter.interface'

import { TYPES } from './types'

@injectable()
export class App {
	app: Express
	port: number
	server: Server | undefined

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.UsersController) private usersController: UsersController,
		@inject(TYPES.ExeptionFilter) private exeptionFilter: IExeptionFilter,
	) {
		this.app = express()
		this.port = 8000
	}

	private useRoutes(): void {
		this.app.use('/users', this.usersController.router)
	}

	private useExeptionFilters(): void {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter))
	}

	public async init(): Promise<void> {
		this.useRoutes()
		this.useExeptionFilters()
		this.server = this.app.listen(this.port, () => {
			this.logger.log(`Сервер запущен на http://localhost:${this.port}`)
		})
	}
}
