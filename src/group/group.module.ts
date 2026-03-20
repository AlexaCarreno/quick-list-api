import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupController } from './group.controller';
import { GROUP_COLLECTION_NAME, GROUP_MODEL_NAME } from './group.interface';
import { GroupRepository } from './group.repository';
import { GroupSchema } from './group.schema';
import { GroupService } from './group.service';
import { StudentGroupModule } from '../student-group/student-group.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: GROUP_MODEL_NAME,
                schema: GroupSchema,
                collection: GROUP_COLLECTION_NAME,
            },
        ]),
        forwardRef(() => StudentGroupModule),
    ],
    providers: [GroupService, GroupRepository],
    controllers: [GroupController],
    exports: [GroupService, GroupRepository],
})
export class GroupModule {}
