import { inject, injectable } from 'inversify'
import { NextFunction, Request, Response } from 'express'
import 'reflect-metadata'

import { HTTPError } from '../errors/http-error.class'
import { BaseController } from '../common/base.controller'

import { ILogger } from '../logger/logger.interface'
import { IControllerRoute } from '../common/route.interface'
import { IUsersController } from './users.controller.interface'

import { TYPES } from '../types'

@injectable()
export class UsersController extends BaseController implements IUsersController {
	private routes: IControllerRoute[] = [
		{ path: '/login', func: this.login, method: 'post' },
		{ path: '/register', func: this.register, method: 'post' },
	]

	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
		super(loggerService)
		this.bindRoutes(this.routes)
	}

	login(req: Request, res: Response, next: NextFunction): void {
		// this.ok(res, 'login')
		next(new HTTPError(401, 'Ошибка авторизации', 'login'))
	}

	register(req: Request, res: Response, next: NextFunction): void {
		this.ok(res, 'register')
	}
}
