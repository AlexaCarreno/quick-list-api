import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import { GetUser } from '../jwt/jwt.decorators';
import { JwtPayload } from '../jwt/jwt.interface';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    @AuthPermissions(ResourceType.USERS, ActionType.READ, [
        RoleName.ADMIN,
        RoleName.TEACHER,
    ])
    @ApiBearerAuth('accessToken')
    async getUserInfo(@GetUser() user: JwtPayload) {
        const { userId } = user;
        return await this.userService.getUserInfoById(userId);
    }
}
