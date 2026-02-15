import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class PermissionCacheService {
    private readonly TTL = 300; // 5 minutos

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    async get<T>(key: string): Promise<T | undefined> {
        return this.cacheManager.get<T>(key);
    }

    async set(key: string, value: unknown, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl ?? this.TTL);
    }

    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    getUserPermissionsKey(userId: string): string {
        return `user:${userId}:permissions`;
    }

    getUserRolesKey(userId: string): string {
        return `user:${userId}:roles`;
    }

    async invalidateUserCache(userId: string): Promise<void> {
        await Promise.all([
            this.del(this.getUserPermissionsKey(userId)),
            this.del(this.getUserRolesKey(userId)),
        ]);
    }
}
