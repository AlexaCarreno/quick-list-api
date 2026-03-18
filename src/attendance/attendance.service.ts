import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { GroupRepository } from '../group/group.repository';
import { StudentGroupRepository } from '../student-group/student-group.repository';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { CreateAttendanceDto, GetAttendancesQueryDto } from './attendance.dto';
import { AttendanceStatus } from './attendance.interface';
import { StudentAttendanceRepository } from '../student-attendance/student-attendance.repository';

@Injectable()
export class AttendanceService {
    constructor(
        private readonly attendanceRepository: AttendanceRepository,
        private readonly groupRepository: GroupRepository,
        private readonly studentGroupRepository: StudentGroupRepository,
        private readonly studentAttendanceRepository: StudentAttendanceRepository,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async create(dto: CreateAttendanceDto, createdBy: string) {
        const group = await this.groupRepository.findById(dto['groupId']);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        // Verificar que no haya una sesión abierta para este grupo
        const hasOpen = await this.attendanceRepository.existsOpenForGroup(
            dto['groupId'],
        );
        if (hasOpen) {
            throw new BadRequestException(
                'Ya existe una sesión de asistencia abierta para este grupo.',
            );
        }

        // Contar estudiantes activos del grupo
        const { total: totalExpected } =
            await this.studentGroupRepository.findByGroupId(dto['groupId'], {
                limit: 1,
                offset: 0,
            });

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const attendance = await this.attendanceRepository.create(
                {
                    groupId: dto['groupId'] as any,
                    date: new Date(dto.date),
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    shift: dto.shift,
                    status: AttendanceStatus.OPEN,
                    totalExpected,
                    totalPresent: 0,
                    createdBy: createdBy as any,
                },
                session,
            );

            await session.commitTransaction();
            return attendance;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    async findByGroupId(groupId: string, query: GetAttendancesQueryDto) {
        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        const { attendances, total } =
            await this.attendanceRepository.findByGroupId(groupId, query);

        const { limit = 10, offset = 0 } = query;

        return {
            metadata: { total, limit, offset },
            attendances,
        };
    }

    async findById(id: string) {
        const attendance = await this.attendanceRepository.findById(id);
        if (!attendance) throw new NotFoundException('Sesión no encontrada.');
        return attendance;
    }

    async close(id: string) {
        const attendance = await this.attendanceRepository.findById(id);
        if (!attendance) throw new NotFoundException('Sesión no encontrada.');

        if (attendance.status === AttendanceStatus.CLOSED) {
            throw new BadRequestException('La sesión ya está cerrada.');
        }

        return this.attendanceRepository.updateById(id, {
            status: AttendanceStatus.CLOSED,
        });
    }

    async updateTotalPresent(id: string, totalPresent: number) {
        return this.attendanceRepository.updateById(id, { totalPresent });
    }

    async delete(id: string) {
        const attendance = await this.attendanceRepository.findById(id);
        if (!attendance) throw new NotFoundException('Sesión no encontrada.');

        if (attendance.status === AttendanceStatus.CLOSED) {
            throw new BadRequestException(
                'No se puede eliminar una sesión cerrada.',
            );
        }

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            await this.studentAttendanceRepository.deleteByAttendanceId(
                id,
                session,
            );
            await this.attendanceRepository.deleteById(id, session);
            await session.commitTransaction();
            return { message: 'Sesión eliminada correctamente.' };
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }
}
