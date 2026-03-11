import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AccountCreationMap, AccountFactory } from './accounts.factory';

@Injectable()
export class AccountService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly accountFactory: AccountFactory,
    ) {}

    async createAcount<T extends keyof AccountCreationMap>(
        type: T,
        data: AccountCreationMap[T]['input'],
    ) {
        const session = await this.connection.startSession();

        try {
            const strategy = this.accountFactory.getStrategy(type);

            return await session.withTransaction(async () => {
                return strategy.create(data, session);
            });
        } finally {
            await session.endSession();
        }
    }
}
