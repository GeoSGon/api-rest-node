import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.findAll();

      return result == null ?
        res.status(404).json({ message: `No User found` }) :
        res.json(result);
    } catch (error) {
      next(error);
    }
  }  

  async getById(req: Request, res: Response, next: NextFunction) {
    const { user_id } = req.params;

    try {
        const result = await this.userService.findById(user_id);

        return result == null ?
          res.status(404).json({ message: `User not found` }) :
          res.json(result);
    } catch (error) {
        next(error);
    }
  }

  async post(req: Request, res: Response, next: NextFunction) {
    const { name, email, password } = req.body;
    try {
      const result = await this.userService.create({ name, email, password});
    
      return result == null ?
        res.status(500).json({ message: 'User invalid' }) :
        res.status(201).json({ message: 'User created successfully!', result });
    } catch (error) {
      next(error);
    }
  }

  async auth(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const result = await this.userService.auth(email, password);

      return result == null ?
        res.status(401).json({ message: 'Authentication invalid' }) :
        res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const { refresh_Token } = req.body;

    try {
      const result = await this.userService.refresh(refresh_Token);

      return result == null ? 
        res.status(401).json({ message: 'Refresh token invalid' }) :
        res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { user_id } = req.params;
    const { name, oldPassword, newPassword, avatar_url } = req.body;
    
    try {
      const result = await this.userService.update({
        user_id,
        name, 
        oldPassword, 
        newPassword, 
        avatar_url
      });

      return result == null ? 
        res.status(500).json({ message: `User not found` }) :
        res.status(200).json({ message: 'User updated successfully!', result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { user_id } = req.params;

    try {
      const result = await this.userService.delete(user_id);

      return result == null ? 
        res.status(404).json({ message: `User not found` }) :
        res.status(204).send();
    } catch (error) {
        next(error);
    }
  }
}

export { UserController };
