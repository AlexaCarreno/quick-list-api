import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { MongoDbModule } from './mongo-db/mongo-config.module';

import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/commons.module';
import { EmailsModule } from './emails/emails.module';
import { GroupModule } from './group/group.module';
import { JwtModule } from './jwt/jwt.module';
import { RBACModule } from './rbac/rbac.module';
import { SessionModule } from './session/session.module';
import { StudentsModule } from './students/students.module';
import { TeacherModule } from './teacher/teacher.module';
import { UserLoginModule } from './user-login/user-login.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { UserSignupModule } from './user-signup/user-signup.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        MongoDbModule,
        ConfigModule,
        CommonModule,
        UserModule,
        SessionModule,
        GroupModule,
        UserSignupModule,
        JwtModule,
        EmailsModule,
        UserLoginModule,
        StudentsModule,
        RBACModule,
        TeacherModule,
        AdminModule,
        UserProfileModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
