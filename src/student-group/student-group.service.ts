import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { StudentGroupRepository } from './student-group.repository';
import { StudentRepository } from '../students/students.repository';
import { GroupRepository } from '../group/group.repository';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import {
    AddStudentsToGroupDto,
    AddStudentToGroupDto,
    GetGroupStudentsQueryDto,
} from './student-group.dto';
import { IStudentGroup } from './student-group.interface';

@Injectable()
export class StudentGroupService {
    constructor(
        private readonly studentGroupRepository: StudentGroupRepository,
        private readonly studentRepository: StudentRepository,
        private readonly groupRepository: GroupRepository,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async addStudentToGroup(groupId: string, dto: AddStudentToGroupDto) {
        // Verificar que el grupo existe
        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        // Verificar que el estudiante existe
        const student = await this.studentRepository.findById(dto.studentId);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');

        // Verificar que no esté ya vinculado
        const existing =
            await this.studentGroupRepository.findByStudentAndGroup(
                dto.studentId,
                groupId,
            );
        if (existing) {
            throw new ConflictException(
                'El estudiante ya está vinculado a este grupo.',
            );
        }

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const studentGroup = await this.studentGroupRepository.create(
                {
                    studentId: dto.studentId as any,
                    groupId: groupId as any,
                    allowed: true,
                },
                session,
            );

            await session.commitTransaction();
            return studentGroup;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    async getGroupStudents(groupId: string, query: GetGroupStudentsQueryDto) {
        // Verificar que el grupo existe
        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        const { students, total } =
            await this.studentGroupRepository.findByGroupId(groupId, query);

        const { limit = 10, offset = 0 } = query;

        return {
            metadata: {
                total,
                limit,
                offset,
            },
            students,
        };
    }

    async removeStudentFromGroup(groupId: string, studentId: string) {
        const studentGroup =
            await this.studentGroupRepository.findByStudentAndGroup(
                studentId,
                groupId,
            );

        if (!studentGroup) {
            throw new NotFoundException(
                'El estudiante no está vinculado a este grupo.',
            );
        }

        await this.studentGroupRepository.deleteById(
            studentGroup._id!.toString(),
        );

        return { message: 'Estudiante desvinculado correctamente.' };
    }

    async toggleStudentAllowed(groupId: string, studentId: string) {
        const studentGroup =
            await this.studentGroupRepository.findByStudentAndGroup(
                studentId,
                groupId,
            );

        if (!studentGroup) {
            throw new NotFoundException(
                'El estudiante no está vinculado a este grupo.',
            );
        }

        return this.studentGroupRepository.updateById(
            studentGroup._id!.toString(),
            { allowed: !studentGroup.allowed },
        );
    }

    async addStudentsToGroup(groupId: string, dto: AddStudentsToGroupDto) {
        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // Filtrar estudiantes válidos y no duplicados
            const toInsert: Partial<IStudentGroup>[] = [];

            for (const studentId of dto.studentIds) {
                const student =
                    await this.studentRepository.findById(studentId);
                if (!student) continue;

                const existing =
                    await this.studentGroupRepository.findByStudentAndGroup(
                        studentId,
                        groupId,
                    );
                if (existing) continue;

                toInsert.push({
                    studentId: studentId as any,
                    groupId: groupId as any,
                    allowed: true,
                });
            }

            if (toInsert.length === 0) {
                await session.abortTransaction();
                return { linked: 0, total: dto.studentIds.length };
            }

            const results = await this.studentGroupRepository.insertMany(
                toInsert,
                session,
            );

            await session.commitTransaction();
            return { linked: results.length, total: dto.studentIds.length };
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }
}
