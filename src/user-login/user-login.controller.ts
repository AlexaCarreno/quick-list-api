import {
    Body,
    Controller,
    NotFoundException,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LoginDto } from './user-login.interface';
import { ServiceResponse } from './user-login.response-example';
import { UserLoginService } from './user-login.service';
import { PublicRoute } from '../common/decorators/public-route.decorator';

@ApiTags('User Sign-in')
@Controller('auth')
export class UserLoginController {
    constructor(private readonly userLoginService: UserLoginService) {}

    @Post('/login')
    @PublicRoute()
    @ApiOperation({ summary: 'Inicio de sesion' })
    @ApiOkResponse(ServiceResponse.loginSuccess)
    public async userLogin(
        @Body() body: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { accessToken, refreshToken } =
            await this.userLoginService.validateCredentials(body, req);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        return { accessToken };
    }

    @Post('/refresh-tokens')
    @PublicRoute()
    @ApiOperation({ summary: 'Rotacion de tokens de acceso' })
    @ApiOkResponse(ServiceResponse.loginSuccess)
    @ApiUnauthorizedResponse(ServiceResponse.refreshTokenUnauthorized)
    public async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const currentRefreshToken = req.cookies['refresh_token'];

        const { accessToken, refreshToken } =
            await this.userLoginService.renewTokens(currentRefreshToken);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        return { accessToken };
    }

    @Post('/logout')
    @PublicRoute()
    @ApiOperation({ summary: 'Finalizar sesion de usuario' })
    @ApiOkResponse(ServiceResponse.logoutSuccess)
    @ApiNotFoundResponse(ServiceResponse.logoutNotFound)
    public async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const currentRefreshToken = req.cookies['refresh_token'];

        // Opcional: validar que exista la cookie
        if (!currentRefreshToken) {
            throw new NotFoundException(
                'No se encontró el refresh_token en las cookies',
            );
        }

        await this.userLoginService.logout(currentRefreshToken);

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
        });

        return { message: 'Sesión finalizada correctamente' };
    }
}
