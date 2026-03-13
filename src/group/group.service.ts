import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CreateGroupDto, GetGroupsQueryDto, UpdateGroupDto } from './group.dto';
import { GroupStatus, IGroup } from './group.interface';
import { GroupRepository } from './group.repository';

@Injectable()
export class GroupService {
    constructor(
        private readonly groupRepository: GroupRepository,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async create(dto: CreateGroupDto, createdBy: string) {
        const existing = await this.groupRepository.findByReferenceCode(
            dto.referenceCode,
        );
        if (existing) {
            throw new ConflictException(
                `Ya existe un grupo con el código ${dto.referenceCode}.`,
            );
        }

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const group = await this.groupRepository.create(
                {
                    ...dto,
                    startDate: new Date(dto.startDate),
                    endDate: new Date(dto.endDate),
                    createdBy: createdBy as any,
                    teacherId: (dto.teacherId as any) ?? null,
                },
                session,
            );

            await session.commitTransaction();
            return group;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    async findAll(query: GetGroupsQueryDto) {
        const { groups, total } = await this.groupRepository.findAll(query);
        const { limit = 10, offset = 0 } = query;

        return {
            metadata: {
                total,
                limit,
                offset,
            },
            groups,
        };
    }

    async findById(id: string) {
        const group = await this.groupRepository.findByIdWithTeacher(id);
        if (!group) throw new NotFoundException('Grupo no encontrado.');
        return group;
    }

    async update(id: string, dto: UpdateGroupDto) {
        const group = await this.groupRepository.findById(id);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        // Verificar conflicto de referenceCode si se está cambiando
        if (dto.referenceCode && dto.referenceCode !== group.referenceCode) {
            const existing = await this.groupRepository.findByReferenceCode(
                dto.referenceCode,
            );
            if (existing) {
                throw new ConflictException(
                    `Ya existe un grupo con el código ${dto.referenceCode}.`,
                );
            }
        }

        const { startDate, endDate, teacherId, ...rest } = dto;

        const updateData: Partial<IGroup> = { ...rest };

        if (dto.startDate) updateData.startDate = new Date(dto.startDate);
        if (dto.endDate) updateData.endDate = new Date(dto.endDate);
        if (dto.teacherId) updateData.teacherId = dto.teacherId as any;

        return this.groupRepository.updateById(id, updateData);
    }

    async toggleStatus(id: string) {
        const group = await this.groupRepository.findById(id);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        const newStatus =
            group.status === GroupStatus.ACTIVE
                ? GroupStatus.INACTIVE
                : GroupStatus.ACTIVE;

        return this.groupRepository.updateById(id, { status: newStatus });
    }

    async delete(id: string) {
        const group = await this.groupRepository.findById(id);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        // Por ahora solo verificamos que el grupo exista
        // Cuando tengamos student_group y asistencia
        // agregaremos las validaciones aquí
        await this.groupRepository.deleteById(id);

        return { message: 'Grupo eliminado correctamente.' };
    }
}
