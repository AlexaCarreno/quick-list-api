import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TeacherModule } from '../teacher/teacher.module';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';

@Module({
    imports: [UserModule, TeacherModule],
    controllers: [UserProfileController],
    providers: [UserProfileService],
    exports: [],
})
export class UserProfileModule {}
