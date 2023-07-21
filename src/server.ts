import express, { Application, Request, Response, NextFunction, } from 'express';
import { UserRepository } from './repositories/UserRepository';
import { UserService } from './services/UserService';
import { UserController } from './controllers/UserController';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { Routes } from './Routes';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);
const authMiddleware = new AuthMiddleware();

const routes = new Routes(userController, authMiddleware).getRoutes();

app.use(routes);

app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        try {
            if (err instanceof Error) {
                return res.status(400).json({
                    message: err.message
                });
            }
            return res.status(500).json({
                message: 'Internal server error'
            });
        } catch (error) {
            next(error);
        }
    }
);

const port = process.env.PORT;

app.listen(port, () => console.log(`Server is running on port: ${port}!`));