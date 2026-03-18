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
import { AttendanceService } from './attendance.service';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { CreateAttendanceDto, GetAttendancesQueryDto } from './attendance.dto';
import { CurrentUser } from '../rbac/decorators/current-user.decorator';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Post()
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.CREATE, [
        RoleName.TEACHER,
    ])
    @ApiOperation({ summary: 'Crear sesión de asistencia' })
    async create(
        @Body() body: CreateAttendanceDto,
        @CurrentUser('userId') userId: string,
    ) {
        return await this.attendanceService.create(body, userId);
    }

    @Get('group/:groupId')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.READ, [
        RoleName.TEACHER,
        RoleName.ADMIN,
    ])
    @ApiOperation({ summary: 'Listar sesiones de asistencia de un grupo' })
    async findByGroupId(
        @Param('groupId') groupId: string,
        @Query() query: GetAttendancesQueryDto,
    ) {
        return await this.attendanceService.findByGroupId(groupId, query);
    }

    @Get(':id')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.READ, [
        RoleName.TEACHER,
        RoleName.ADMIN,
    ])
    @ApiOperation({ summary: 'Obtener sesión de asistencia por ID' })
    async findOne(@Param('id') id: string) {
        return await this.attendanceService.findById(id);
    }

    @Patch(':id/close')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.UPDATE, [
        RoleName.TEACHER,
    ])
    @ApiOperation({ summary: 'Cerrar sesión de asistencia' })
    async close(@Param('id') id: string) {
        return await this.attendanceService.close(id);
    }

    @Delete(':id')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.DELETE, [
        RoleName.TEACHER,
    ])
    @ApiOperation({ summary: 'Eliminar sesión de asistencia' })
    async delete(@Param('id') id: string) {
        return await this.attendanceService.delete(id);
    }
}
