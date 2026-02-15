import {
    applyDecorators,
    createParamDecorator,
    ExecutionContext,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwtAuth.guard';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

export function Auth() {
    return applyDecorators(UseGuards(JwtAuthGuard));
}
