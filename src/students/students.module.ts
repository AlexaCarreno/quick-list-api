import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    STUDENT_COLLECTION_NAME,
    STUDENT_MODEL_NAME,
} from './students.interface';
import { StudentRepository } from './students.repository';
import { StudentSchema } from './students.schema';
import { StorageService } from '../common/service/storage.service';
import { StudentController } from './students.controller';
import { StudentService } from './students.service';
import { FaceModule } from '../face/face.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: STUDENT_MODEL_NAME,
                schema: StudentSchema,
                collection: STUDENT_COLLECTION_NAME,
            },
        ]),
        FaceModule,
    ],
    providers: [StudentRepository, StudentService, StorageService],
    controllers: [StudentController],
    exports: [StudentService, StudentRepository],
})
export class StudentsModule {}
