import { UserRepository } from '../repositories/UserRepository';
import { ICreate, IUpdate } from '../interfaces/UserInterface';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { s3 } from '../config/aws';
import { uuid } from 'uuidv4';

class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
      this.userRepository = userRepository;
    }

    async findAll() {
        const users = await this.userRepository.findAll();

        if (!users) throw new Error('No user found');
    
        return users;
    }

    async findById(user_id: string) { 
        const findUser = await this.userRepository.findById(user_id);

        if (!findUser) throw new Error(`User not found`);
    
        return findUser;
    }

    async create({ name, email, password }: ICreate) {
        const findUser = await this.userRepository.findByEmail(email);

        if(findUser) throw new Error('User already exists');

        const hashPassword = await hash(password, 10);

        const newUser = await this.userRepository.create({ 
            name, 
            email, 
            password: hashPassword
        });

        return newUser;
    }

    async auth(email: string, password: string) {
        const findUser = await this.userRepository.findByEmail(email);

        if (!findUser) throw new Error('User or password invalid');

        const passwordMatch = compare(password, findUser.password);

        if(!passwordMatch) throw new Error('Password invalid');

        let secretkey: string | undefined = process.env.ACCESS_KEY_TOKEN;

        if (!secretkey) throw new Error('There is no secret key')

        const token = sign({ email }, secretkey, {
            subject: findUser.id,
            expiresIn: '60s'
        });

        const refreshToken =  sign({ email }, secretkey, {
            subject: findUser.id,
            expiresIn: '7d'
        });

        return {
            token,
            refresh_Token: refreshToken,
            user: {
                name: findUser.name,
                email: findUser.email
            }
        }
    }

    async refresh(refresh_Token: string) {
        if(!refresh_Token) throw new Error('Refresh token missing');

        let secretKeyRefresh: string | undefined = process.env.ACCESS_KEY_TOKEN_REFRESH;

        if (!secretKeyRefresh) throw new Error('There is no refresh token key');
    
        let secretKey: string | undefined = process.env.ACCESS_KEY_TOKEN;

        if (!secretKey) throw new Error('There is no token key');

        const verifyRefreshToken = verify(refresh_Token, secretKeyRefresh);
    
        const { sub } = verifyRefreshToken;
    
        const newToken = sign({ sub }, secretKey, {
            expiresIn: '1h',
        });

        const refreshToken = sign({ sub }, secretKeyRefresh, {
            expiresIn: '7d',
        });

        return { token: newToken, refresh_token: refreshToken };
    }

    async update({ user_id, name, oldPassword, newPassword, avatar_url }: IUpdate) {
        let password;

        if(oldPassword && newPassword) {
            const findById = await this.userRepository.findById(user_id);

            if(!findById) throw new Error(`User not found`);

            const passwordMatch = compare(oldPassword, findById.password);

            if(!passwordMatch) throw new Error('Password invalid');

            password = await hash(newPassword, 10);

            await this.userRepository.updatePassword(newPassword, user_id);
        }

        if (avatar_url) {
            const uploadImage = avatar_url?.buffer;
            const uploadS3 = await s3.upload({
            Bucket: 'api-login',
            Key: `${uuid()}-${avatar_url?.originalname}`,
            ACL: 'public_url',
            Body: uploadImage
            }).promise();

            await this.userRepository.update(user_id, name, uploadS3.Location);
        }
    }

    async delete(user_id: string) {
        const findUser = await this.userRepository.findById(user_id);
    
        if (!findUser) throw new Error(`User not found`);
    
        await this.userRepository.delete(user_id);
    }
}

export { UserService };