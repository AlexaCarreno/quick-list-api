import {
    BadRequestException,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Request } from 'express';
import { generateAlphaNumericCode, hashPassword } from '../common/utils/bcrypt';
import { EmailsService } from '../emails/emails.service';
import { SessionService } from '../session/session.service';
import { IUser } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { SignupStep1Dto, SignupStep2Dto } from './user-signup.dto';
import { signupVerificationTemplate } from './user-signup.template';
import { RbacService } from '../rbac/services/rbac.service';
import { RoleName } from '../rbac/roles/role.interface';

@Injectable()
export class UserSignupService {
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
        private readonly emailService: EmailsService,
        private readonly rbacService: RbacService,
    ) {}

    public async handleStepOne(stepOne: SignupStep1Dto) {
        const { name, lastName, birthdate, email, password } = stepOne;

        const encryptedPassword = await hashPassword(password);
        const verificationCode = generateAlphaNumericCode(6);

        const userToSave: Partial<IUser> = {
            name,
            lastName,
            birthday: new Date(birthdate),
            email,
            password: encryptedPassword,
            photo: '',
            state: true,
            verification: {
                status: false,
                code: verificationCode,
                updatedAt: new Date(),
            },
            changePassword: false,
        };

        // Crear usuario (sin roleId)
        const newUser = await this.userService.createUser(userToSave);

        if (!newUser) {
            throw new UnprocessableEntityException(
                'The user could not be created.',
            );
        }

        // Asignar rol ESTUDIANTE por defecto
        await this.rbacService.assignRoleToUser(
            newUser._id!.toString(),
            RoleName.ADMIN,
        );

        // Enviar código de verificación
        const template = signupVerificationTemplate(verificationCode);
        await this.emailService.sendMail(
            email,
            'Verificación de Registro en QuickList',
            template,
        );

        return {
            newUser: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                lastName: newUser.lastName,
            },
        };
    }

    public async handleStepTwo(stepTwo: SignupStep2Dto, req: Request) {
        const { code, email } = stepTwo;

        if (!this.isEmailFormat(email)) {
            throw new BadRequestException('Correo electrónico no válido');
        }

        const user = await this.userService.findByEmail(email);
        const userId = user._id!.toString();

        if (user.verification?.status === true) {
            throw new BadRequestException(
                'Este usuario ya ha sido verificado.',
            );
        }

        const isMatches = this.verificationCodeMatches(code, user);
        if (!isMatches) {
            throw new BadRequestException(
                'El código de verificación es incorrecto.',
            );
        }

        // Actualizar verificación
        await this.userService.updateVerification(userId);

        // Crear sesión y tokens (con roles desde RBAC)
        const ip = req.ip || req.connection.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        const { accessToken, refreshToken } =
            await this.sessionService.createSesionAndTokens(
                userId,
                ip,
                userAgent,
            );

        return {
            message: 'Verificación completada exitosamente.',
            accessToken,
            refreshToken,
        };
    }

    private verificationCodeMatches(code: string, user: IUser): boolean {
        if (!user.verification) {
            return false;
        }
        return user.verification.code === code;
    }

    private isEmailFormat(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    public async handleResendCode(email: string) {
        if (!this.isEmailFormat(email)) {
            throw new BadRequestException('Correo electrónico no válido');
        }

        const user = await this.userService.findByEmail(email);

        if (user.verification?.status) {
            throw new BadRequestException(
                'El usuario ya se encuentra verificado.',
            );
        }

        const code = generateAlphaNumericCode(6);
        await this.userService.updateVerificationCode(user._id!, code);

        const template = signupVerificationTemplate(code);
        await this.emailService.sendMail(
            email,
            'Verificación de Registro en QuickList',
            template,
        );

        return { message: 'code_sent_successfully' };
    }
}
