import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TeacherModule } from '../teacher/teacher.module';
import { AccountsController } from './accounts.controller';
import { AccountService } from './accounts.service';
import { AccountFactory } from './accounts.factory';
import { CreateTeacherStrategy } from './strategies/create-teacher.strategy';

@Module({
    imports: [UserModule, TeacherModule],
    controllers: [AccountsController],
    providers: [AccountService, AccountFactory, CreateTeacherStrategy],
    exports: [],
})
export class AccountsModule {}
