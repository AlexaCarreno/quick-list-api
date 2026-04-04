import { Module } from '@nestjs/common';
import { AttendanceModule } from '../attendance/attendance.module';
import { StudentAttendanceModule } from '../student-attendance/student-attendance.module';
import { StudentGroupModule } from '../student-group/student-group.module';
import { GroupModule } from '../group/group.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { StudentsModule } from '../students/students.module';
import { ReportsExportService } from './reports-export.service';

@Module({
    imports: [
        AttendanceModule,
        StudentAttendanceModule,
        StudentGroupModule,
        GroupModule,
        StudentsModule,
    ],
    providers: [ReportsService, ReportsExportService],
    controllers: [ReportsController],
})
export class ReportsModule { }
