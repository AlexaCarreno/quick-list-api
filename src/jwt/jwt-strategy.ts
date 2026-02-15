// auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom'; // Usamos 'passport-custom' para control total
import { Request } from 'express';
import { JwtService } from '../jwt/jwt.service'; // tu servicio personalizado

interface JwtPayload {
    userId: string;
    roles: string[]; // Array de nombres de roles
    iat?: number;
    exp?: number;
    iss?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly jwtService: JwtService) {
        super();
    }

    async validate(req: Request): Promise<any> {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException(
                'Missing or invalid Authorization header',
            );
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload =
                this.jwtService.verifyAccessToken<JwtPayload>(token);

            // Validar que el payload tenga la estructura correcta
            if (
                !payload.userId ||
                !payload.roles ||
                !Array.isArray(payload.roles)
            ) {
                throw new UnauthorizedException('Token payload inválido');
            }

            // Este objeto estará disponible como req.user
            return {
                userId: payload.userId,
                roles: payload.roles, // Array de roles: ['estudiante'], ['admin', 'docente'], etc.
            };
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
