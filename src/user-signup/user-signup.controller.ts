import { Body, Controller, Patch, Post, Req, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { EmailDto, SignupStep1Dto, SignupStep2Dto } from './user-signup.dto';
import { UserSignupService } from './user-signup.service';
import { ServiceResponse } from './user-signup.response-example';
import { PublicRoute } from '../common/decorators/public-route.decorator';

@ApiTags('Sign-up')
@Controller('user-signup')
export class UserSignupController {
    constructor(private readonly signupService: UserSignupService) {}

    @Post('/step-one')
    @PublicRoute()
    @ApiOperation({ summary: 'Primer paso, datos del usuario' })
    @ApiOkResponse(ServiceResponse.signupStepOneSuccess)
    @ApiConflictResponse(ServiceResponse.signupStepOneConflict)
    public async stepOne(@Body() body: SignupStep1Dto) {
        return await this.signupService.handleStepOne(body);
    }

    @Patch('/step-two')
    @PublicRoute()
    @ApiOperation({ summary: 'Segundo paso, confirmacion de registro' })
    @ApiOkResponse(ServiceResponse.signupSteoTwoSuccess)
    @ApiConflictResponse(ServiceResponse.resendCodeBadRequest)
    public async stepTwo(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() body: SignupStep2Dto,
    ) {
        // Ahora retorna tokens con roles desde RBAC
        const { accessToken, message, refreshToken } =
            await this.signupService.handleStepTwo(body, req);

        // Configurar cookie segura para refresh token
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
        });

        return { message, accessToken };
    }

    @Post('/resend-code')
    @ApiOperation({
        summary: 'Reenviar código de verificación al email del usuario',
    })
    @PublicRoute()
    @ApiOkResponse(ServiceResponse.resendCodeSuccess)
    @ApiBadRequestResponse(ServiceResponse.resendCodeBadRequest)
    public async resentCode(@Body() { email }: EmailDto) {
        return await this.signupService.handleResendCode(email);
    }
}
