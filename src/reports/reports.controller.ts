import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { GroupReportQueryDto, StudentReportQueryDto } from './reports.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('group/:groupId')
    @AuthPermissions(ResourceType.REPORTS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Reporte de asistencia por grupo' })
    async getGroupReport(
        @Param('groupId') groupId: string,
        @Query() query: GroupReportQueryDto,
    ) {
        return await this.reportsService.getGroupReport(groupId, query);
    }

    @Get('student/:studentId/periods')
    @AuthPermissions(ResourceType.REPORTS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Listar periodos disponibles de un estudiante' })
    async getStudentPeriods(@Param('studentId') studentId: string) {
        return await this.reportsService.getStudentPeriods(studentId);
    }

    @Get('student/:studentId')
    @AuthPermissions(ResourceType.REPORTS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Reporte de asistencia por estudiante' })
    async getStudentReport(
        @Param('studentId') studentId: string,
        @Query() query: StudentReportQueryDto,
    ) {
        return await this.reportsService.getStudentReport(studentId, query);
    }
}
