import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDbConfigService } from './mongo-db.service';
import { ConfigService } from '../config/config.service';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useClass: MongoDbConfigService,
            inject: [ConfigService],
        }),
    ],
})
export class MongoDbModule {}
