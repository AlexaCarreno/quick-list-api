import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ITeacher } from '../teacher/teacher.interface';
import { CreateTeacherInput } from './inputs/create-teacher.input';
import { AccountCreationStrategy } from './strategies/account-creation.strategy';
import { CreateTeacherStrategy } from './strategies/create-teacher.strategy';

export type AccountCreationMap = {
    teacher: {
        input: CreateTeacherInput;
        result: ITeacher;
    };
    //   admin: {
    //     input: CreateAdminDto
    //     result: Admin
    //   }
};

@Injectable()
export class AccountFactory {
    private strategies = new Map<string, AccountCreationStrategy<any, any>>();

    constructor(teacherStrategy: CreateTeacherStrategy) {
        this.strategies.set(teacherStrategy.type, teacherStrategy);
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
