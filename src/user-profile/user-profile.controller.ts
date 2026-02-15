import {
    Body,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../jwt/jwtAuth.guard';

import { CurrentUser } from '../rbac/decorators/current-user.decorator';
import { Roles } from '../rbac/decorators/role.decorator';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RoleName } from '../rbac/roles/role.interface';

import { UserProfileService } from './user-profile.service';
import { CreateTeacherDto } from './user-profile.dto';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermission } from '../rbac/decorators/permission.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';

@Controller('users')
export class UserProfileController {
    constructor(private readonly userProfileService: UserProfileService) {}

    @Post('/teacher')
    @Roles(RoleName.ADMIN)
    @RequirePermission(ResourceType.USERS, ActionType.CREATE)
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiBearerAuth('accessToken')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 3 * 1024 * 1024 },
        }),
    )
    async createTeacher(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateTeacherDto,
        @CurrentUser('userId') userId: string,
    ) {
        const response = await this.userProfileService.createTeacher(
            body,
            file,
        );

        return {
            response,
            userId,
            body,
            photo: file
                ? {
                      originalname: file.originalname,
                      mimetype: file.mimetype,
                      size: file.size,
                  }
                : null,
        };
    }
}
