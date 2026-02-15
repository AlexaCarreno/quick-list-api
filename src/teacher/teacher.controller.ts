import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { GetTeachersQueryDto } from './teacher.dto';
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
}
