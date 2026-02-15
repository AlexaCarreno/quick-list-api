import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { comparePassword } from '../common/utils/bcrypt';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './user-login.interface';

@Injectable()
export class UserLoginService {
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
    ) {}

    public async validateCredentials(params: LoginDto, req: Request) {
        const { email, password } = params;
        const user = await this.userService.findByEmail(email);

        const isCorrect = await comparePassword(password, user.password);

        if (!isCorrect) {
            throw new BadRequestException('Incorrect password');
        }

        if (!user.verification?.status) {
            throw new ForbiddenException(
                'Debe verificar el registro de usuario.',
            );
        }

        const { _id: userId } = user;

        const ip = req.ip || req.connection.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        return await this.sessionService.createSesionAndTokens(
            userId!,
            ip,
            userAgent,
        );
    }

    public async renewTokens(refreshToken: string) {
        return await this.sessionService.renewTokens(refreshToken);
    }

    public async logout(refreshToken: string) {
        return await this.sessionService.logout(refreshToken);
    }
}
