import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { GetAdminsQueryDto, UpdateAdminDto } from './admin.dto';
import { AdminService } from './admin.service';
import { imageFileFilter } from '../common/utils/file-filter';

@Controller('admins')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    /* --------------------------------------------------
     * GET /admins
     * -------------------------------------------------- */
    @Get()
    @AuthPermissions(ResourceType.USERS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Find all admins' })
    async getAdmins(@Query() query: GetAdminsQueryDto) {
        return await this.adminService.findAll(query);
    }

    /* --------------------------------------------------
     * PATCH /admins/:id
     * -------------------------------------------------- */
    @Patch(':id')
    @AuthPermissions(ResourceType.USERS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Update admin profile' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 3 * 1024 * 1024 },
            fileFilter: imageFileFilter,
        }),
    )
    async updateAdmin(
        @Param('id') id: string,
        @Body() body: UpdateAdminDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return await this.adminService.updateAdmin(id, body, file);
    }

    /* --------------------------------------------------
     * PATCH /admins/:id/toggle-state
     * -------------------------------------------------- */
    @Patch(':id/toggle-state')
    @AuthPermissions(ResourceType.USERS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Toggle admin active state' })
    async toggleState(@Param('id') id: string) {
        return await this.adminService.toggleState(id);
    }
}
