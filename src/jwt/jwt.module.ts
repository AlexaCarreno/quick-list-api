import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtAuthGuard } from './jwtAuth.guard';
import { JwtStrategy } from './jwt-strategy';

@Global()
@Module({
    providers: [JwtService, JwtAuthGuard, JwtStrategy],
    exports: [JwtService, JwtAuthGuard],
})
export class JwtModule {}
