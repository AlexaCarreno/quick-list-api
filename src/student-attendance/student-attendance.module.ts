import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    STUDENT_ATTENDANCE_COLLECTION_NAME,
    STUDENT_ATTENDANCE_MODEL_NAME,
} from './student-attendance.interface';
import { StudentAttendanceSchema } from './student-attendance.schema';
import { AttendanceModule } from '../attendance/attendance.module';
import { StudentGroupModule } from '../student-group/student-group.module';
import { FaceModule } from '../face/face.module';
import { StudentAttendanceRepository } from './student-attendance.repository';
import { StudentAttendanceService } from './student-attendance.service';
import { StudentAttendanceController } from './student-attendance.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: STUDENT_ATTENDANCE_MODEL_NAME,
                schema: StudentAttendanceSchema,
                collection: STUDENT_ATTENDANCE_COLLECTION_NAME,
            },
        ]),
        forwardRef(() => AttendanceModule),
        StudentGroupModule,
        FaceModule,
    ],
    providers: [StudentAttendanceRepository, StudentAttendanceService],
    controllers: [StudentAttendanceController],
    exports: [StudentAttendanceService, StudentAttendanceRepository],
})
export class StudentAttendanceModule {}
