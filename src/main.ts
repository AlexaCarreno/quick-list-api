import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/errors/global.filter';
import { StandardResponseInterceptor } from './common/interceptors/standard-response.interceptor';
import { envs } from './config/config.envs';
import * as express from 'express';
import * as path from 'path';
import { JwtAuthGuard } from './jwt/jwtAuth.guard';

async function bootstrap() {
    const port: number = envs.app_port ?? 3000;
    const logger = new Logger('Main');

    const prefix = '/api/v1';
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix(prefix);

    app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

    app.enableCors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.use(cookieParser());

    app.useGlobalGuards(app.get(JwtAuthGuard));

    app.useGlobalInterceptors(new StandardResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('QuickList API')
        .setDescription('Esta es la documentacion de la API para QuickList')
        .setVersion('0.0.1')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'Bearer',
                bearerFormat: 'JWT',
                description: 'Ingresar su token JWT aqui',
            },
            'accessToken',
        )
        .build();

    const documentFactory = () =>
        SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${prefix}/docs`, app, documentFactory);

    await app.listen(port);

    logger.debug(`App running on port: [ ${port} ]`);
}
bootstrap();
