import { Router } from 'express';
import { UserController } from './controllers/UserController';
import { upload } from './config/multer';
import { AuthMiddleware } from './middlewares/AuthMiddleware';

class Routes {
    private router: Router;
    private userController: UserController;
    private authMiddleware: AuthMiddleware;

    constructor(userController: UserController, authMiddleware: AuthMiddleware) {
        this.router = Router();
        this.userController = userController;
        this.authMiddleware = authMiddleware;
    }

    getRoutes() {
        this.router.get('/users', this.userController.get.bind(this.userController));
        this.router.get('/users/:user_id', this.userController.getById.bind(this.userController));
        this.router.post('/users/create', this.userController.post.bind(this.userController));
        this.router.put(
            '/users/edit/:user_id', 
            upload.single('avatar_url'), 
            this.authMiddleware.auth.bind(this.authMiddleware), 
            this.userController.update.bind(this.userController)
        );
        this.router.post('/users/auth', this.userController.auth.bind(this.userController));
        this.router.post('/users/refresh', this.userController.refresh.bind(this.userController));
        this.router.delete('/users/:user_id', this.userController.delete.bind(this.userController));

        return this.router;
    }
}

export { Routes };