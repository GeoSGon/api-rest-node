import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
    sub: string;
}

class AuthMiddleware {
    auth(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                code: 'token.missing',
                message: 'Token missing'
            });
        }

        const [token] = authHeader.split('');

        let secretkey: string | undefined = process.env.ACCESS_KEY_TOKEN;

        if (!secretkey) throw new Error('There is no secret key')

        try {
            const { sub } = verify(token, secretkey) as IPayload;
            req.user_id = sub;

            return next();
        } catch (error) {
            return res.status(401).json({
                code: 'token.expired',
                message: 'Token expired'
            })
        }
    }
}

export { AuthMiddleware };