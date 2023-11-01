import { verify } from 'jsonwebtoken'
import { inject, injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'

import { TYPES } from '../types'
import { IMiddleware } from './middleware.interface'
import { IConfigService } from '../config/config.service.interface'

@injectable()
export class AuthMiddleware implements IMiddleware {
	constructor(private secret: string) {}

	execute(req: Request, res: Response, next: NextFunction): void {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1]
			verify(token, this.secret, (err, payload) => {
				if (err) {
					next()
				} else if (payload && typeof payload !== 'string') {
					req.user = payload.email
					next()
				}
			})
		} else {
			next()
		}
	}
}
