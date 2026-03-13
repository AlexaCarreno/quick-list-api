import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageService } from '../common/service/storage.service';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { ADMIN_COLLECTION_NAME, ADMIN_MODEL_NAME } from './admin.interface';
import { AdminRepository } from './admin.repository';
import { AdminSchema } from './admin.schema';
import { AdminService } from './admin.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ADMIN_MODEL_NAME,
                schema: AdminSchema,
                collection: ADMIN_COLLECTION_NAME,
            },
        ]),
        UserModule,
    ],
    controllers: [AdminController],
    providers: [AdminRepository, AdminService, StorageService],
    exports: [AdminService],
})
export class AdminModule {}
