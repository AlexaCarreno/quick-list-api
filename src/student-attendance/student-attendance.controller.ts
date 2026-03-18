import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentAttendanceService } from './student-attendance.service';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import {
    GetStudentAttendancesQueryDto,
    RecognizeFaceDto,
    UpdateStudentAttendanceDto,
} from './student-attendance.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../common/utils/file-filter';

@ApiTags('Student Attendance')
@Controller('attendance')
export class StudentAttendanceController {
    constructor(
        private readonly studentAttendanceService: StudentAttendanceService,
    ) {}

    @Post(':attendanceId/init')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.CREATE, [
        RoleName.TEACHER,
    ])
    @ApiOperation({ summary: 'Inicializar registros de asistencia del grupo' })
    async init(@Param('attendanceId') attendanceId: string) {
        return await this.studentAttendanceService.initAttendance(attendanceId);
    }

    @Get(':attendanceId/students')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.READ, [
        RoleName.TEACHER,
        RoleName.ADMIN,
    ])
    @ApiOperation({ summary: 'Listar estudiantes con su estado en la sesión' })
    async findByAttendanceId(
        @Param('attendanceId') attendanceId: string,
        @Query() query: GetStudentAttendancesQueryDto,
    ) {
        return await this.studentAttendanceService.findByAttendanceId(
            attendanceId,
            query,
        );
    }

    @Patch(':attendanceId/students/:studentId')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.UPDATE, [
        RoleName.TEACHER,
        RoleName.ADMIN,
    ])
    @ApiOperation({ summary: 'Actualizar estado de asistencia manualmente' })
    async updateStudentStatus(
        @Param('attendanceId') attendanceId: string,
        @Param('studentId') studentId: string,
        @Body() body: UpdateStudentAttendanceDto,
    ) {
        return await this.studentAttendanceService.updateStudentStatus(
            attendanceId,
            studentId,
            body,
        );
    }

    @Post(':attendanceId/recognize')
    @AuthPermissions(ResourceType.ATTENDANCE, ActionType.UPDATE, [
        RoleName.TEACHER,
    ])
    @ApiOperation({ summary: 'Reconocer rostro y marcar presente' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: RecognizeFaceDto })
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: imageFileFilter,
        }),
    )
    async recognizeFace(
        @Param('attendanceId') attendanceId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.studentAttendanceService.recognizeFace(
            attendanceId,
            file,
        );
    }
}
