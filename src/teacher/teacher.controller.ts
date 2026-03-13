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
import { ApiConsumes, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import { imageFileFilter } from '../common/utils/file-filter';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { GetTeachersQueryDto, UpdateTeacherDto } from './teacher.dto';
import { ServiceResponse } from './teacher.response-example';
import { TeacherService } from './teacher.service';

@Controller('teachers')
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) {}

    @Get()
    @AuthPermissions(ResourceType.USERS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'find all teachers' })
    @ApiOkResponse(ServiceResponse.findAllTeacherSuccess)
    async getTeachers(@Query() query: GetTeachersQueryDto) {
        return await this.teacherService.findAll(query);
    }

    @Patch(':id')
    @AuthPermissions(ResourceType.USERS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 3 * 1024 * 1024 },
            fileFilter: imageFileFilter,
        }),
    )
    async updateTeacher(
        @Param('id') id: string,
        @Body() body: UpdateTeacherDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return await this.teacherService.updateTeacher(id, body, file);
    }

    @Patch(':id/toggle-state')
    @AuthPermissions(ResourceType.USERS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Toggle teacher active state' })
    async toggleState(@Param('id') id: string) {
        return await this.teacherService.toggleState(id);
    }
}
