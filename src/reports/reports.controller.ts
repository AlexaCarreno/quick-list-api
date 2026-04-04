import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { GroupReportQueryDto, StudentReportQueryDto } from './reports.dto';
import { ReportsService } from './reports.service';
import { ReportsExportService } from './reports-export.service';
import { Response } from 'express';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly reportsExportService: ReportsExportService
    ) { }

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

    @Get('group/:groupId/export')
    @AuthPermissions(ResourceType.REPORTS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Exportar reporte de grupo a Excel' })
    async exportGroupReport(
        @Param('groupId') groupId: string,
        @Query() query: GroupReportQueryDto,
        @Res() res: Response,
    ) {
        const report = await this.reportsService.getGroupReport(groupId, query);
        const buffer =
            await this.reportsExportService.generateGroupReportXlsx(report);

        const suffix = query.month
            ? `_${query.month}`
            : query.from
                ? `_${query.from}_${query.to ?? ''}`
                : '_completo';

        const filename = `reporte_${report.group.referenceCode}_${report.group.period}${suffix}.xlsx`;

        res.header(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.header(
            'Content-Disposition',
            `attachment; filename="${filename}"`,
        );
        res.header('Content-Length', String(buffer.length));
        res.end(buffer);
    }

    @Get('student/:studentId/export')
    @AuthPermissions(ResourceType.REPORTS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Exportar reporte de estudiante a Excel' })
    async exportStudentReport(
        @Param('studentId') studentId: string,
        @Query() query: StudentReportQueryDto,
        @Res() res: Response,
    ) {
        const report = await this.reportsService.getStudentReport(studentId, query);
        const buffer = await this.reportsExportService.generateStudentReportXlsx(report);

        const filename = `reporte_${report.profile.documentNumber}_${query.period}.xlsx`;

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.header('Content-Length', String(buffer.length));
        res.end(buffer);
    }
}
