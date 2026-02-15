import { Injectable, Logger } from '@nestjs/common';
import {
    MongooseModuleOptions,
    MongooseOptionsFactory,
} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MongoDbConfigService implements MongooseOptionsFactory {
    private readonly logger = new Logger(MongoDbConfigService.name);
    constructor(private readonly configService: ConfigService) {}

    createMongooseOptions():
        | Promise<MongooseModuleOptions>
        | MongooseModuleOptions {
        return {
            uri: this.configService.get('mongo_uri'),
        };
    }

    async onModuleInit() {
        try {
            await mongoose.connection.asPromise();
            this.logger.debug('✅ Conectado a MONGODB correctamente');
        } catch (error) {
            this.logger.error('❌ Error conectando a MongoDB: ', error);
        }
    }
}
