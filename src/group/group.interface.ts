import { UpdateQuery } from 'mongoose';

export const GROUP_MODEL_NAME = 'Group';
export const GROUP_COLLECTION_NAME = 'group';

export enum GroupStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
}
export interface IGroup {
    _id: string;
    userId: string;
    institutionName: string;
    subject: string;
    referenceCode: string;
    status: GroupStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ICreateGroup = Pick<
    IGroup,
    'userId' | 'institutionName' | 'subject' | 'referenceCode'
>;

export interface IUpdateGroup {
    groupId: string;
    userId: string;
    dataToUpdate: Partial<IGroup | UpdateQuery<IGroup>>;
}

export interface IGroupRepository {
    create(group: ICreateGroup): Promise<IGroup>;
    findById(userId: string, groupId: string): Promise<IGroup | null>;
    findAll(userId: string): Promise<IGroup[]>;
    update(params: IUpdateGroup): Promise<IGroup | null>;
}
