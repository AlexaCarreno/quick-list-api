import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { USER_COLLECTION_NAME, USER_MODEL_NAME } from './user.interface';
import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: USER_MODEL_NAME,
                schema: UserSchema,
                collection: USER_COLLECTION_NAME,
            },
        ]),
    ],
    providers: [UserService, UserRepository],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
