import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TeacherModule } from '../teacher/teacher.module';
import { AccountsController } from './accounts.controller';
import { AccountService } from './accounts.service';
import { AccountFactory } from './accounts.factory';
import { CreateTeacherStrategy } from './strategies/create-teacher.strategy';
import { CreateAdminStrategy } from './strategies/create-admin.strategy';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [UserModule, TeacherModule, AdminModule],
    controllers: [AccountsController],
    providers: [
        AccountService,
        AccountFactory,
        CreateTeacherStrategy,
        CreateAdminStrategy,
    ],
    exports: [AccountService],
})
export class AccountsModule {}
