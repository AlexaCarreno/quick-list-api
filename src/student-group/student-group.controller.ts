import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentGroupService } from './student-group.service';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import {
    AddStudentsToGroupDto,
    AddStudentToGroupDto,
    GetGroupStudentsQueryDto,
} from './student-group.dto';

@ApiTags('Group Students')
@Controller('groups/:groupId/students')
export class StudentGroupController {
    constructor(private readonly studentGroupService: StudentGroupService) {}

    @Get()
    @AuthPermissions(ResourceType.GROUPS, ActionType.READ, [
        RoleName.ADMIN,
        RoleName.TEACHER,
    ])
    @ApiOperation({ summary: 'Listar estudiantes de un grupo' })
    async getGroupStudents(
        @Param('groupId') groupId: string,
        @Query() query: GetGroupStudentsQueryDto,
    ) {
        return await this.studentGroupService.getGroupStudents(groupId, query);
    }

    @Post()
    @AuthPermissions(ResourceType.GROUPS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Vincular estudiante a un grupo' })
    async addStudent(
        @Param('groupId') groupId: string,
        @Body() body: AddStudentToGroupDto,
    ) {
        return await this.studentGroupService.addStudentToGroup(groupId, body);
    }

    @Delete(':studentId')
    @AuthPermissions(ResourceType.GROUPS, ActionType.DELETE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Desvincular estudiante de un grupo' })
    async removeStudent(
        @Param('groupId') groupId: string,
        @Param('studentId') studentId: string,
    ) {
        return await this.studentGroupService.removeStudentFromGroup(
            groupId,
            studentId,
        );
    }

    @Patch(':studentId/toggle')
    @AuthPermissions(ResourceType.GROUPS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Activar o desactivar estudiante en el grupo' })
    async toggleAllowed(
        @Param('groupId') groupId: string,
        @Param('studentId') studentId: string,
    ) {
        return await this.studentGroupService.toggleStudentAllowed(
            groupId,
            studentId,
        );
    }

    @Post('bulk')
    @AuthPermissions(ResourceType.GROUPS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Vincular múltiples estudiantes a un grupo' })
    async addStudents(
        @Param('groupId') groupId: string,
        @Body() body: AddStudentsToGroupDto,
    ) {
        return await this.studentGroupService.addStudentsToGroup(groupId, body);
    }
}
