import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupController } from './group.controller';
import { GROUP_COLLECTION_NAME, GROUP_MODEL_NAME } from './group.interface';
import { GroupRepository } from './group.repository';
import { GroupSchema } from './group.schema';
import { GroupService } from './group.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: GROUP_MODEL_NAME,
                schema: GroupSchema,
                collection: GROUP_COLLECTION_NAME,
            },
        ]),
    ],
    controllers: [GroupController],
    providers: [
        GroupService,
        {
            provide: 'IGroupRepository',
            useClass: GroupRepository,
        },
    ],
})
export class GroupModule {}
