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

import { Roles } from '../rbac/decorators/role.decorator';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RoleName } from '../rbac/roles/role.interface';

import { imageFileFilter } from '../common/utils/file-filter';
import { RequirePermission } from '../rbac/decorators/permission.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { CreateAdminDto, CreateTeacherDto } from './accounts.dto';
import { AccountService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountService: AccountService) {}

    @Post('/teachers')
    @Roles(RoleName.ADMIN)
    @RequirePermission(ResourceType.USERS, ActionType.CREATE)
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiBearerAuth('accessToken')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 3 * 1024 * 1024 },
            fileFilter: imageFileFilter,
        }),
    )
    async createTeacher(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateTeacherDto,
    ) {
        const response = await this.accountService.createAcount('teacher', {
            data: body,
            file,
        });

        return response;
    }

    @Post('/admins')
    @Roles(RoleName.ADMIN)
    @RequirePermission(ResourceType.USERS, ActionType.CREATE)
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiBearerAuth('accessToken')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 3 * 1024 * 1024 },
            fileFilter: imageFileFilter,
        }),
    )
    async createAdmin(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateAdminDto,
    ) {
        return await this.accountService.createAcount('admin', {
            data: body,
            file,
        });
    }
}
