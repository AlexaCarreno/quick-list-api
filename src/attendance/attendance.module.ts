import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    ATTENDANCE_COLLECTION_NAME,
    ATTENDANCE_MODEL_NAME,
} from './attendance.interface';
import { AttendanceSchema } from './attendance.schema';
import { GroupModule } from '../group/group.module';
import { StudentGroupModule } from '../student-group/student-group.module';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceController } from './attendance.controller';
import { StudentAttendanceModule } from '../student-attendance/student-attendance.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ATTENDANCE_MODEL_NAME,
                schema: AttendanceSchema,
                collection: ATTENDANCE_COLLECTION_NAME,
            },
        ]),
        GroupModule,
        StudentGroupModule,
        forwardRef(() => StudentAttendanceModule),
    ],
    providers: [AttendanceRepository, AttendanceService],
    controllers: [AttendanceController],
    exports: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
