import { json } from 'body-parser'
import { Server } from 'http'
import express, { Express } from 'express'
import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { PrismaService } from './database/prisma.service'
import { AuthMiddleware } from './common/auth.middleware'
import { UsersController } from './users/users.controller'

import { ILogger } from './logger/logger.interface.js'
import { IConfigService } from './config/config.service.interface'
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
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
	) {
		this.app = express()
		this.port = 8000
	}

	private useMiddlewares(): void {
		this.app.use(json())
		const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'))
		this.app.use(authMiddleware.execute.bind(authMiddleware))
	}

	private useRoutes(): void {
		this.app.use('/users', this.usersController.router)
	}

	private useExeptionFilters(): void {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter))
	}

	public async init(): Promise<void> {
		this.useMiddlewares()
		this.useRoutes()
		this.useExeptionFilters()
		await this.prismaService.connect()
		this.server = this.app.listen(this.port, () => {
			this.logger.log(`Сервер запущен на http://localhost:${this.port}`)
		})
	}
}
