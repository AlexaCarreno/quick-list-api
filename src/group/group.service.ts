import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './group.dto';
import {
    GroupStatus,
    ICreateGroup,
    IGroupRepository,
    IUpdateGroup,
} from './group.interface';

@Injectable()
export class GroupService {
    constructor(
        @Inject('IGroupRepository')
        private readonly groupRepository: IGroupRepository,
    ) {}

    async createGroup(userId: string, group: CreateGroupDto) {
        const newGroup: ICreateGroup = {
            userId,
            ...group,
        };
        const savedGroup = await this.groupRepository.create(newGroup);

        const {
            _id,
            institutionName,
            subject,
            referenceCode,
            status,
            createdAt,
            updatedAt,
        } = savedGroup;

        return {
            _id,
            institutionName,
            subject,
            referenceCode,
            status,
            createdAt,
            updatedAt,
        };
    }

    async findOne(groupId: string, userId: string) {
        const group = await this.groupRepository.findById(userId, groupId);

        if (!group) {
            throw new NotFoundException(
                `El grupo con Id: '${groupId}' no fue encontrado.`,
            );
        }

        return group;
    }

    async findAll(userId: string) {
        return await this.groupRepository.findAll(userId);
    }

    async updateGroup(userId: string, groupId: string, group: UpdateGroupDto) {
        const dataToUpdate: IUpdateGroup = {
            groupId,
            userId,
            dataToUpdate: { ...group },
        };
        const updatedGroup = await this.groupRepository.update(dataToUpdate);
        if (!updatedGroup) {
            throw new NotFoundException('Grupo no encontrado.');
        }
        const {
            _id,
            institutionName,
            subject,
            referenceCode,
            status,
            createdAt,
            updatedAt,
        } = updatedGroup;

        return {
            _id,
            institutionName,
            subject,
            referenceCode,
            status,
            createdAt,
            updatedAt,
        };
    }

    async updateGroupStatus(
        userId: string,
        groupId: string,
        status: GroupStatus,
    ) {
        const dataToUpdate: IUpdateGroup = {
            userId,
            groupId,
            dataToUpdate: { status },
        };

        const updatedGroup = await this.groupRepository.update(dataToUpdate);
        if (!updatedGroup) {
            throw new NotFoundException('Grupo no encontrado.');
        }
        return updatedGroup;
    }

    // todo: add delete group?
}
