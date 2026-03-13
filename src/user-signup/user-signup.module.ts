import { Module } from '@nestjs/common';
import { EmailsModule } from '../emails/emails.module';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';
import { UserSignupController } from './user-signup.controller';
import { UserSignupService } from './user-signup.service';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
    imports: [UserModule, SessionModule, EmailsModule, AccountsModule],
    controllers: [UserSignupController],
    providers: [UserSignupService],
    exports: [],
})
export class UserSignupModule {}
