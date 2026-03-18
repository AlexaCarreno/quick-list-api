import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { StudentAttendanceRepository } from './student-attendance.repository';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { StudentGroupRepository } from '../student-group/student-group.repository';
import { FaceService } from '../face/face.service';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import {
    AttendanceMethod,
    StudentAttendanceStatus,
} from './student-attendance.interface';
import {
    GetStudentAttendancesQueryDto,
    UpdateStudentAttendanceDto,
} from './student-attendance.dto';
import { AttendanceStatus } from '../attendance/attendance.interface';

@Injectable()
export class StudentAttendanceService {
    constructor(
        private readonly studentAttendanceRepository: StudentAttendanceRepository,
        private readonly attendanceRepository: AttendanceRepository,
        private readonly studentGroupRepository: StudentGroupRepository,
        private readonly faceService: FaceService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async initAttendance(attendanceId: string) {
        const attendance =
            await this.attendanceRepository.findById(attendanceId);
        if (!attendance) throw new NotFoundException('Sesión no encontrada.');

        // Verificar que no se haya inicializado ya
        const alreadyInit =
            await this.studentAttendanceRepository.existsByAttendanceId(
                attendanceId,
            );
        if (alreadyInit) return { message: 'Sesión ya inicializada.' };

        // Obtener todos los estudiantes activos del grupo
        const { students } = await this.studentGroupRepository.findByGroupId(
            attendance.groupId.toString(),
            { limit: 1000, offset: 0 },
        );

        if (students.length === 0)
            return { message: 'No hay estudiantes en el grupo.' };

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // Crear registro de ausente para cada estudiante
            const records = students.map((s) => ({
                attendanceId: attendance._id,
                studentId: (s.studentId as any)._id,
                status: StudentAttendanceStatus.ABSENT,
                method: AttendanceMethod.MANUAL,
            }));

            await this.studentAttendanceRepository.insertMany(records, session);
            await session.commitTransaction();

            return {
                message: 'Sesión inicializada correctamente.',
                total: records.length,
            };
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    async findByAttendanceId(
        attendanceId: string,
        query: GetStudentAttendancesQueryDto,
    ) {
        const attendance =
            await this.attendanceRepository.findById(attendanceId);
        if (!attendance) throw new NotFoundException('Sesión no encontrada.');

        const { students, total } =
            await this.studentAttendanceRepository.findByAttendanceId(
                attendanceId,
                query,
            );

        const { limit = 10, offset = 0 } = query;

        return {
            metadata: { total, limit, offset },
            students,
        };
    }

    async updateStudentStatus(
        attendanceId: string,
        studentId: string,
        dto: UpdateStudentAttendanceDto,
    ) {
        const record =
            await this.studentAttendanceRepository.findByAttendanceAndStudent(
                attendanceId,
                studentId,
            );

        if (!record) throw new NotFoundException('Registro no encontrado.');

        const updated = await this.studentAttendanceRepository.updateById(
            record._id!.toString(),
            {
                status: dto.status,
                method: AttendanceMethod.MANUAL,
            },
        );

        // Actualizar totalPresent en la sesión
        const totalPresent =
            await this.studentAttendanceRepository.countPresentByAttendanceId(
                attendanceId,
            );
        await this.attendanceRepository.updateById(attendanceId, {
            totalPresent,
        });

        return updated;
    }

    async recognizeFace(attendanceId: string, file: Express.Multer.File) {
        const attendance =
            await this.attendanceRepository.findById(attendanceId);
        if (!attendance) throw new NotFoundException('Sesión no encontrada.');

        if (attendance.status === AttendanceStatus.CLOSED) {
            throw new BadRequestException('La sesión ya está cerrada.');
        }

        // Obtener IDs de estudiantes del grupo
        const { students } = await this.studentGroupRepository.findByGroupId(
            attendance.groupId.toString(),
            { limit: 1000, offset: 0 },
        );

        const studentIds = students.map((s) =>
            (s.studentId as any)._id.toString(),
        );

        if (studentIds.length === 0) {
            throw new BadRequestException('No hay estudiantes en el grupo.');
        }

        // Llamar al microservicio de reconocimiento facial
        const result = await this.faceService.recognizeFace(file, studentIds);

        if (!result.recognized || !result.student_id) {
            return { recognized: false, message: 'Rostro no identificado.' };
        }

        // Marcar al estudiante como presente
        const record =
            await this.studentAttendanceRepository.findByAttendanceAndStudent(
                attendanceId,
                result.student_id,
            );

        if (!record) {
            throw new NotFoundException(
                'Estudiante no encontrado en esta sesión.',
            );
        }

        // Solo actualizar si estaba ausente (no sobreescribir tardanza o justificado)
        if (record.status === StudentAttendanceStatus.ABSENT) {
            await this.studentAttendanceRepository.updateById(
                record._id!.toString(),
                {
                    status: StudentAttendanceStatus.PRESENT,
                    method: AttendanceMethod.FACIAL,
                    recognitionTime: new Date(),
                },
            );

            // Actualizar totalPresent
            const totalPresent =
                await this.studentAttendanceRepository.countPresentByAttendanceId(
                    attendanceId,
                );
            await this.attendanceRepository.updateById(attendanceId, {
                totalPresent,
            });
        }

        return {
            recognized: true,
            student_id: result.student_id,
            distance: result.distance,
        };
    }
}
