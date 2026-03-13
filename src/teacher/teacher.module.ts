import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    TEACHER_COLLECTION_NAME,
    TEACHER_MODEL_NAME,
} from './teacher.interface';
import { TeacherRepository } from './teacher.repository';
import { TeacherSchema } from './teacher.schema';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { StorageService } from '../common/service/storage.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: TEACHER_MODEL_NAME,
                schema: TeacherSchema,
                collection: TEACHER_COLLECTION_NAME,
            },
        ]),
        UserModule,
    ],
    controllers: [TeacherController],
    providers: [TeacherRepository, TeacherService, StorageService],
    exports: [TeacherService],
})
export class TeacherModule {}
