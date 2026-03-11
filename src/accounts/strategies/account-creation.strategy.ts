import { ClientSession } from 'mongoose';

export interface AccountCreationStrategy<TInput, TResult> {
    create(data: TInput, session: ClientSession): Promise<TResult>;
}



