import { sign } from 'jsonwebtoken'
import { inject, injectable } from 'inversify'
import { NextFunction, Request, Response } from 'express'
import 'reflect-metadata'

import { AuthGuard } from '../common/auth.guard'
import { HTTPError } from '../errors/http-error.class'
import { BaseController } from '../common/base.controller'

import { ILogger } from '../logger/logger.interface'
import { IUsersService } from './users.service.interface'
import { IConfigService } from '../config/config.service.interface'
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
		{
			path: '/info',
			func: this.info,
			method: 'get',
			middlewares: [new AuthGuard()],
		},
	]

	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UsersService) private usersService: IUsersService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
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
		const jwt = await this.signJWT(body.email, this.configService.get('SECRET'))
		this.ok(res, { jwt })
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

	async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		const userInfo = await this.usersService.getUserInfo(user)
		this.ok(res, { email: userInfo?.email, id: userInfo?.id })
	}

	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err)
					}
					resolve(token as string)
				},
			)
		})
	}
}
