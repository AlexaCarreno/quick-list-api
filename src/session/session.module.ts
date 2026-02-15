import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';
import {
    REFRESH_TOKEN_COLLECTION_NAME,
    REFRESH_TOKEN_MODEL_NAME,
    SESION_COLLECTION_NAME,
    SESION_MODEL_NAME,
} from './session.interfaces';
import { SessionRepository } from './session.repository';
import { RefreshTokenSchema, SessionSchema } from './session.schema';
import { SessionService } from './session.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: SESION_MODEL_NAME,
                schema: SessionSchema,
                collection: SESION_COLLECTION_NAME,
            },
            {
                name: REFRESH_TOKEN_MODEL_NAME,
                schema: RefreshTokenSchema,
                collection: REFRESH_TOKEN_COLLECTION_NAME,
            },
        ]),
        UserModule,
    ],
    providers: [SessionService, SessionRepository],
    exports: [SessionService],
})
export class SessionModule {}
