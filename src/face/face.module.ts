import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { FaceService } from './face.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [FaceService],
    exports: [FaceService],
})
export class FaceModule {}
