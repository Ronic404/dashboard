import { inject, injectable } from 'inversify'
import { NextFunction, Request, Response } from 'express'
import 'reflect-metadata'

import { HTTPError } from '../errors/http-error.class'
import { BaseController } from '../common/base.controller'

import { ILogger } from '../logger/logger.interface'
import { IUsersService } from './users.service.interface'
import { IControllerRoute } from '../common/route.interface'
import { IUsersController } from './users.controller.interface'

import { TYPES } from '../types'
import { UserLoginDto } from './dto/user-login.dto'
import { UserRegisterDto } from './dto/user-register.dto'

import { ValidateMiddleware } from '../common/validate.middleware'

@injectable()
export class UsersController extends BaseController implements IUsersController {
	private routes: IControllerRoute[] = [
		{
			path: '/login',
			func: this.login,
			method: 'post',
			middlewares: [new ValidateMiddleware(UserLoginDto)],
		},
		{
			path: '/register',
			func: this.register,
			method: 'post',
			middlewares: [new ValidateMiddleware(UserRegisterDto)],
		},
	]

	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UsersService) private usersService: IUsersService,
	) {
		super(loggerService)
		this.bindRoutes(this.routes)
	}

	async login(
		{ body }: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.validateUser(body)
		if (!result) {
			return next(new HTTPError(401, 'Ошибка авторизации', 'login'))
		}
		this.ok(res, {})
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.createUser(body)
		if (!result) {
			return next(new HTTPError(422, 'Такой пользователь уже существует'))
		}
		this.ok(res, { email: result.email, id: result.id })
	}
}
