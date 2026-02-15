import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse } from 'platform';
import { JwtService } from '../jwt/jwt.service';
import { AuthorizationService } from '../rbac/services/authorization.service';
import { UserService } from '../user/user.service';
import {
    IRefreshToken,
    ISesion,
    REFRESH_TOKEN_MODEL_NAME,
} from './session.interfaces';
import { SessionRepository } from './session.repository';

@Injectable()
export class SessionService {
    constructor(
        private readonly sessionRepository: SessionRepository,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly authorizationService: AuthorizationService,
        @InjectModel(REFRESH_TOKEN_MODEL_NAME)
        private readonly refreshTokenModel: Model<IRefreshToken>,
    ) {}

    private async createSesion(userId: string, ip: string, userAgent: string) {
        const { name: platform, os } = parse(userAgent);
        const osName = os?.family;

        const sessionData: Partial<ISesion> = {
            userId,
            ip,
            os: osName,
            platform,
        };

        const session = await this.sessionRepository.create(sessionData);
        if (!session) {
            throw new UnprocessableEntityException(
                'No se pudo crear la sesión',
            );
        }

        return session;
    }

    private async createRefreshToken(userId: string, sessionId: string) {
        const existing = await this.refreshTokenModel.findOne({
            userId,
            sessionId,
        });

        const refreshToken = this.jwtService.signRefreshToken({
            userId,
            sessionId,
        });

        await this.refreshTokenModel.findOneAndUpdate(
            { userId, sessionId },
            {
                $set: {
                    token: refreshToken,
                    prevToken: existing?.token ?? null,
                },
                $setOnInsert: {
                    userId,
                    sessionId,
                },
            },
            { upsert: true, new: true },
        );

        return refreshToken;
    }

    /**
     * Obtiene los roles del usuario desde el sistema RBAC
     */
    private async getUserRoles(userId: string): Promise<string[]> {
        const roles = await this.authorizationService.getUserRoles(userId);
        return roles.map((role) => role.name);
    }

    /**
     * Crea sesión y tokens con los roles del sistema RBAC
     */
    public async createSesionAndTokens(
        userId: string,
        ip: string,
        userAgent: string,
    ) {
        // Crear sesión
        const session: ISesion = await this.createSesion(userId, ip, userAgent);

        // Verificar que el usuario existe
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Obtener roles del usuario desde RBAC
        const userRoles = await this.getUserRoles(userId);

        if (!userRoles || userRoles.length === 0) {
            throw new UnprocessableEntityException(
                'El usuario no tiene roles asignados',
            );
        }

        // Crear accessToken con roles (tu JwtService usa RS256)
        const accessToken = this.jwtService.signAccessToken({
            userId,
            roles: userRoles, // Array de roles
        });

        // Crear refreshToken
        const refreshToken = await this.createRefreshToken(
            userId,
            session._id!.toString(),
        );

        return { accessToken, refreshToken };
    }

    /**
     * Renueva los tokens obteniendo los roles ACTUALIZADOS del usuario
     */
    public async renewTokens(refreshToken: string) {
        // Verificar refresh token
        const payload = this.jwtService.verifyRefreshToken<{
            userId: string;
            sessionId: string;
        }>(refreshToken);
        const { sessionId, userId } = payload;

        // Validar token en BD
        const storedToken = await this.refreshTokenModel.findOne({
            userId,
            sessionId,
        });

        if (
            !storedToken ||
            storedToken.token !== refreshToken ||
            storedToken.revoked
        ) {
            throw new UnauthorizedException(
                'Refresh token inválido, reutilizado o revocado.',
            );
        }

        // Validar sesión
        const session = await this.sessionRepository.findById(sessionId);
        if (!session || !session.isActive || session.userId !== userId) {
            throw new UnprocessableEntityException(
                'Sesión inválida o cerrada.',
            );
        }

        if (session.expiresAt && session.expiresAt < new Date()) {
            throw new UnprocessableEntityException('Sesión expirada.');
        }

        // Verificar usuario
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Obtener roles ACTUALES del usuario (pueden haber cambiado)
        const userRoles = await this.getUserRoles(userId);

        if (!userRoles || userRoles.length === 0) {
            throw new UnprocessableEntityException(
                'El usuario no tiene roles asignados',
            );
        }

        // Crear nuevos tokens con roles actualizados
        const newAccessToken = this.jwtService.signAccessToken({
            userId,
            roles: userRoles,
        });

        const newRefreshToken = await this.createRefreshToken(
            userId,
            session._id!.toString(),
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    public async logout(refreshToken: string) {
        const payload = this.jwtService.verifyRefreshToken<{
            userId: string;
            sessionId: string;
        }>(refreshToken);
        const { sessionId, userId } = payload;

        const session = await this.sessionRepository.findById(sessionId);
        if (!session || session.userId !== userId) {
            throw new NotFoundException('Sesión no encontrada.');
        }

        if (!session.isActive) {
            return {
                message: 'La sesión ya estaba cerrada.',
                alreadyClosed: true,
            };
        }

        // Marcar sesión como inactiva
        await this.sessionRepository.updateById(sessionId, {
            isActive: false,
            revokedAt: new Date(),
        });

        // Revocar refresh token
        await this.refreshTokenModel.updateOne(
            { userId, sessionId },
            { $set: { revoked: true, revokedAt: new Date() } },
        );

        return { message: 'Sesión cerrada correctamente.', revoked: true };
    }
}
