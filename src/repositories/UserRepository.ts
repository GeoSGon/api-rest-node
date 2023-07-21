import { prisma } from '../database/prisma';
import { ICreate } from '../interfaces/UserInterface'

class UserRepository {
  async findAll() {
    const users = await prisma.users.findMany();
    return users;
  }
  
  async findById(user_id: string) {
    const userId = await prisma.users.findUnique({
        where: {
          id: user_id
        }
    });

    return userId;
  }

  async findByEmail(email: string) {
    const userEmail = await prisma.users.findUnique({
        where: {
            email: email
        }
    });

    return userEmail;
  }

  async create({ name, email, password }: ICreate) {
    const newUser = await prisma.users.create({
        data: {
            name,
            email,
            password
        }
    });

    return newUser;
  }

  async update(user_id: string, name: string, avatar_url: string) {
    const userUpdate = await prisma.users.update({
      where: {
        id: user_id
      },
      data: {
        name,
        avatar_url
      }
    });

    return userUpdate;
  }

  async updatePassword(newPassword: string, user_id: string) {
    const userUpdatePasword = await prisma.users.update({
      where: {
        id: user_id
      },
      data: {
        password: newPassword,
      }
    });

    return userUpdatePasword;
  }

  async delete(user_id: string) {
    await prisma.users.delete({
        where: {
          id: user_id
        }
    });
  }
}


export { UserRepository };