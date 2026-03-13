import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ITeacher } from '../teacher/teacher.interface';
import { CreateTeacherInput } from './inputs/create-teacher.input';
import { AccountCreationStrategy } from './strategies/account-creation.strategy';
import { CreateTeacherStrategy } from './strategies/create-teacher.strategy';
import { CreateAdminInput } from './inputs/create-admin.input';
import { IAdmin } from '../admin/admin.interface';
import { CreateAdminStrategy } from './strategies/create-admin.strategy';

export type AccountCreationMap = {
    teacher: {
        input: CreateTeacherInput;
        result: ITeacher;
    };
    admin: {
        input: CreateAdminInput;
        result: IAdmin;
    };
};

@Injectable()
export class AccountFactory {
    private strategies = new Map<string, AccountCreationStrategy<any, any>>();

    constructor(
        teacherStrategy: CreateTeacherStrategy,
        adminStrategy: CreateAdminStrategy,
    ) {
        this.strategies.set(teacherStrategy.type, teacherStrategy);
        this.strategies.set(adminStrategy.type, adminStrategy);
    }

    getStrategy<T extends keyof AccountCreationMap>(
        type: T,
    ): AccountCreationStrategy<
        AccountCreationMap[T]['input'],
        AccountCreationMap[T]['result']
    > {
        const strategy = this.strategies.get(type);

        if (!strategy) {
            throw new InternalServerErrorException(
                `Strategy not found for ${type}`,
            );
        }

        return strategy;
    }
}
