import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    STUDENT_GROUP_COLLECTION_NAME,
    STUDENT_GROUP_MODEL_NAME,
} from './student-group.interface';
import { StudentGroupSchema } from './student-group.schema';
import { GroupModule } from '../group/group.module';
import { StudentsModule } from '../students/students.module';
import { StudentGroupRepository } from './student-group.repository';
import { StudentGroupController } from './student-group.controller';
import { StudentGroupService } from './student-group.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: STUDENT_GROUP_MODEL_NAME,
                schema: StudentGroupSchema,
                collection: STUDENT_GROUP_COLLECTION_NAME,
            },
        ]),
        forwardRef(() => GroupModule), // exporta GroupRepository
        StudentsModule, // exporta StudentRepository
    ],
    providers: [StudentGroupRepository, StudentGroupService],
    controllers: [StudentGroupController],
    exports: [StudentGroupService, StudentGroupRepository],
})
export class StudentGroupModule {}
