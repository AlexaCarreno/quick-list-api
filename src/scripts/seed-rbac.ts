import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacSeeder } from '../rbac/rbac.seeder';

async function bootstrap() {
    console.log('🚀 Starting RBAC seeding process...\n');

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['log', 'error', 'warn'],
    });

    try {
        const seeder = app.get(RbacSeeder);
        await seeder.seed();

        console.log('\n🎉 Seeding process completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

bootstrap();
