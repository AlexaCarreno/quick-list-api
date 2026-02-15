import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';
import { UserLoginController } from './user-login.controller';
import { UserLoginService } from './user-login.service';

@Module({
    imports: [UserModule, SessionModule],
    providers: [UserLoginService],
    controllers: [UserLoginController],
})
export class UserLoginModule {}
