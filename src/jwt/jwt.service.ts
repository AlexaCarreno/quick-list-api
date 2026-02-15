import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JwtService {
    private readonly accessPrivateKey: jwt.Secret;
    private readonly accessPublicKey: jwt.Secret;
    private readonly refreshSecret: jwt.Secret;

    constructor(private readonly configService: ConfigService) {
        this.accessPrivateKey = Buffer.from(
            this.configService.get('jwt_private_key'),
            'base64',
        ).toString('utf-8');

        this.accessPublicKey = Buffer.from(
            this.configService.get('jwt_public_key'),
            'base64',
        ).toString('utf-8');

        // Refresh token
        this.refreshSecret = this.configService.get('jwt_refresh_secret_key');
        if (!this.refreshSecret) {
            throw new Error('Missing refreshTokenSecret in config.');
        }
    }

    signAccessToken<T extends object>(
        payload: T,
        expiresIn: jwt.SignOptions['expiresIn'] = '15d',
    ) {
        const options: jwt.SignOptions = {
            algorithm: 'RS256',
            expiresIn,
            issuer: 'quickList',
        };

        return jwt.sign(payload, this.accessPrivateKey, options);
    }

    verifyAccessToken<T = any>(token: string): T {
        return jwt.verify(token, this.accessPublicKey, {
            algorithms: ['RS256'],
        }) as T;
    }

    signRefreshToken<T extends object>(
        payload: T,
        expiresIn: jwt.SignOptions['expiresIn'] = '7d',
    ) {
        const options: jwt.SignOptions = {
            algorithm: 'HS256',
            expiresIn,
            issuer: 'quickList',
        };

        return jwt.sign(payload, this.refreshSecret, options);
    }

    verifyRefreshToken<T = any>(refreshToken: string) {
        return jwt.verify(refreshToken, this.refreshSecret, {
            algorithms: ['HS256'],
        }) as T;
    }
}
