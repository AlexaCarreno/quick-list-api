import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentSchema } from './students.schema';
import {
    STUDENT_COLLECTION_NAME,
    STUDENT_MODEL_NAME,
} from './students.interface';
import { StudentRepository } from './students.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: STUDENT_MODEL_NAME,
                schema: StudentSchema,
                collection: STUDENT_COLLECTION_NAME,
            },
        ]),
    ],
    controllers: [StudentsController],
    providers: [StudentsService, StudentRepository],
})
export class StudentsModule {}
