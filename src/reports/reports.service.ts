import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { GroupRepository } from '../group/group.repository';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { StudentAttendanceRepository } from '../student-attendance/student-attendance.repository';
import { StudentGroupRepository } from '../student-group/student-group.repository';
import { GroupReportQueryDto, StudentReportQueryDto } from './reports.dto';
import {
    GroupReportResponse,
    SessionsByMonth,
    SessionSummary,
    StudentPeriodsResponse,
    StudentReportProfile,
    StudentReportResponse,
    StudentReportRow,
    SubjectAttendanceRow,
} from './reports.interface';
import { Types } from 'mongoose';
import { StudentRepository } from '../students/students.repository';

// Mapeo de status de BD → letra del reporte
const STATUS_MAP: Record<string, 'P' | 'A' | 'R' | 'J'> = {
    present: 'P',
    absent: 'A',
    late: 'R',
    excused: 'J',
};

// Nombres de meses en español
const MONTH_NAMES = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
];

// Nombres de días en español (abreviados)
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Injectable()
export class ReportsService {
    constructor(
        private readonly groupRepository: GroupRepository,
        private readonly attendanceRepository: AttendanceRepository,
        private readonly studentAttendanceRepository: StudentAttendanceRepository,
        private readonly studentGroupRepository: StudentGroupRepository,
        private readonly studentRepository: StudentRepository,
    ) { }

    async getGroupReport(
        groupId: string,
        query: GroupReportQueryDto,
    ): Promise<GroupReportResponse> {
        if (!Types.ObjectId.isValid(groupId)) {
            throw new BadRequestException('ID de grupo inválido.');
        }

        // Al inicio de getGroupReport, antes de buildDateFilter
        if (query.month && (query.from || query.to)) {
            throw new BadRequestException('No puedes usar month junto con from/to.');
        }

        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new NotFoundException('Grupo no encontrado.');

        const dateFilter = this.buildDateFilter(query);

        const { attendances: sessions } =
            await this.attendanceRepository.findByGroupIdForReport(
                groupId,
                dateFilter,
            );

        console.log('sessions found:', sessions.length); // ← agregar
        console.log('dateFilter:', dateFilter);

        if (sessions.length === 0) {
            return this.buildEmptyReport(group, groupId);
        }

        const sessionIds = sessions.map((s) => s._id!.toString());

        const { studentGroups } =
            await this.studentGroupRepository.findAllByGroupId(groupId);

        const students = studentGroups
            .map((sg: any) => sg.studentId)
            .filter(Boolean);

        const rawAttendances =
            await this.studentAttendanceRepository.findByAttendanceIds(
                sessionIds,
            );

        const sessionStudentMap = this.buildSessionStudentMap(rawAttendances);
        const allSessions = this.buildSessionMetadata(sessions);
        const sessionsByMonth = this.groupSessionsByMonth(allSessions);
        const minThreshold = this.normalizeThreshold(
            group.minAttendanceThreshold,
        );

        const studentRows = students.map((student: any, idx: number) =>
            this.buildStudentRow(
                student,
                studentGroups[idx],
                allSessions,
                sessionStudentMap,
                minThreshold,
            ),
        );

        const sessionAverages = this.calculateSessionAverages(
            allSessions,
            studentGroups,
            sessionStudentMap,
        );

        const groupAverage = this.calculateGroupAverage(studentRows);
        const studentsAtRisk = studentRows.filter(
            (s) => s.summary.status !== 'approved',
        ).length;

        return {
            group: {
                id: groupId,
                subject: group.subject,
                referenceCode: group.referenceCode,
                period: group.period,
                minAttendanceThreshold: minThreshold,
            },
            metrics: {
                totalStudents: students.length,
                groupAverage,
                totalSessions: sessions.length,
                studentsAtRisk,
            },
            sessionsByMonth,
            allSessions,
            students: studentRows,
            sessionAverages,
            cumulativeAverage: groupAverage,
        };
    }

    private buildDateFilter(query: GroupReportQueryDto): Record<string, Date> {
        const filter: Record<string, Date> = {};

        if (query.month) {
            const [year, month] = query.month.split('-').map(Number);
            const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
            const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // día 0 del mes siguiente = último día del mes actual
            filter.$gte = from;
            filter.$lte = to;
        } else {
            if (query.from) {
                const from = new Date(query.from);
                from.setUTCHours(0, 0, 0, 0);
                filter.$gte = from;
            }
            if (query.to) {
                const to = new Date(query.to);
                to.setUTCHours(23, 59, 59, 999);
                filter.$lte = to;
            }
        }

        return filter;
    }

    private buildSessionStudentMap(
        rawAttendances: any[],
    ): Map<string, Map<string, 'P' | 'A' | 'R' | 'J'>> {
        const map = new Map<string, Map<string, 'P' | 'A' | 'R' | 'J'>>();

        for (const sa of rawAttendances) {
            const sessionId = sa.attendanceId.toString();
            const studentId = sa.studentId.toString();
            const status = STATUS_MAP[sa.status] ?? 'A';

            if (!map.has(sessionId)) map.set(sessionId, new Map());
            map.get(sessionId)!.set(studentId, status);
        }

        return map;
    }

    private buildSessionMetadata(sessions: any[]): SessionSummary[] {
        return sessions.map((s) => {
            const date = new Date(s.date);
            const month = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
            const dayLabel = `${date.getDate()} ${DAY_NAMES[date.getDay()]}`;

            // createdAt es el timestamp UTC exacto en que el docente abrió
            // la sesión — se usa para determinar si un estudiante aplica,
            // evitando la ambigüedad de timezone que tiene el campo startTime.
            const startTimestamp = new Date(s.createdAt!);

            return {
                sessionId: s._id!.toString(),
                date: s.date,
                startTimestamp,
                dayLabel,
                month,
            };
        });
    }

    private groupSessionsByMonth(
        sessions: SessionSummary[],
    ): SessionsByMonth[] {
        const map = new Map<string, SessionSummary[]>();

        for (const s of sessions) {
            if (!map.has(s.month)) map.set(s.month, []);
            map.get(s.month)!.push(s);
        }

        return Array.from(map.entries()).map(([month, sessions]) => ({
            month,
            sessions,
        }));
    }

    private normalizeThreshold(raw: number | undefined): number {
        const value = raw ?? 0.75;
        return value <= 1 ? Math.round(value * 100) : value;
    }

    private buildStudentRow(
        student: any,
        studentGroup: any,
        allSessions: SessionSummary[],
        sessionStudentMap: Map<string, Map<string, 'P' | 'A' | 'R' | 'J'>>,
        minThreshold: number,
    ): StudentReportRow {
        const studentId = student._id.toString();
        const enrolledAt = new Date(studentGroup.createdAt);

        const attendanceMap: Record<string, 'P' | 'A' | 'R' | 'J' | 'N/A' | null> = {};
        let present = 0;
        let absent = 0;
        let retarded = 0;
        let justified = 0;
        let applicableSessions = 0;

        for (const session of allSessions) {
            if (enrolledAt > session.startTimestamp) {
                attendanceMap[session.sessionId] = 'N/A';
                continue;
            }

            applicableSessions++;
            const status =
                sessionStudentMap.get(session.sessionId)?.get(studentId) ?? null;
            attendanceMap[session.sessionId] = status;

            if (status === 'P') present++;
            else if (status === 'R') retarded++;
            else if (status === 'J') justified++;
            else absent++; // null y 'A' = ausente
        }

        const percentage = this.calculatePercentage(
            present,
            retarded,
            justified,        // ← nuevo parámetro
            applicableSessions,
        );

        return {
            studentId,
            name: student.name,
            lastName: student.lastName,
            documentNumber: student.documentNumber,
            attendanceMap,
            summary: {
                present: present + retarded + justified, // ← asistió de alguna forma
                absent,
                retarded,
                justified,
                applicableSessions,
                percentage,
                status: this.resolveAttendanceStatus(percentage, minThreshold),
            },
        };
    }

    private calculateSessionAverages(
        allSessions: SessionSummary[],
        studentGroups: any[],
        sessionStudentMap: Map<string, Map<string, 'P' | 'A' | 'R' | 'J'>>,
    ): Record<string, number> {
        const averages: Record<string, number> = {};

        for (const session of allSessions) {
            const eligibleCount = studentGroups.filter(
                (sg) => new Date(sg.createdAt) <= session.startTimestamp,
            ).length;

            if (eligibleCount === 0) {
                averages[session.sessionId] = 0;
                continue;
            }

            const map = sessionStudentMap.get(session.sessionId);
            if (!map) {
                averages[session.sessionId] = 0;
                continue;
            }

            const presentCount = [...map.values()].filter(
                (v) => v === 'P' || v === 'R' || v === 'J',
            ).length;

            averages[session.sessionId] = Math.round(
                (presentCount / eligibleCount) * 100,
            );
        }

        return averages;
    }

    private calculateGroupAverage(students: StudentReportRow[]): number {
        if (students.length === 0) return 0;
        const total = students.reduce(
            (acc, s) => acc + s.summary.percentage,
            0,
        );
        return Math.round(total / students.length);
    }

    private calculatePercentage(
        present: number,
        retarded: number,
        justified: number,        // ← nuevo parámetro
        applicableSessions: number,
    ): number {
        const effectiveSessions = applicableSessions - justified; // J no penaliza
        if (effectiveSessions === 0) return 0;
        const effective = present + retarded * 0.5;
        return Math.round((effective / effectiveSessions) * 100);
    }

    private resolveAttendanceStatus(
        percentage: number,
        minThreshold: number,
    ): 'approved' | 'at_risk' | 'critical' {
        if (percentage >= minThreshold) return 'approved';
        if (percentage >= minThreshold * 0.6) return 'at_risk';
        return 'critical';
    }

    private buildEmptyReport(group: any, groupId: string): GroupReportResponse {
        return {
            group: {
                id: groupId,
                subject: group.subject,
                referenceCode: group.referenceCode,
                period: group.period,
                minAttendanceThreshold: this.normalizeThreshold(
                    group.minAttendanceThreshold,
                ),
            },
            metrics: {
                totalStudents: 0,
                groupAverage: 0,
                totalSessions: 0,
                studentsAtRisk: 0,
            },
            sessionsByMonth: [],
            allSessions: [],
            students: [],
            sessionAverages: {},
            cumulativeAverage: 0,
        };
    }

    async getStudentPeriods(
        studentId: string,
    ): Promise<StudentPeriodsResponse> {
        if (!Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('ID de estudiante inválido.');
        }

        const student = await this.studentRepository.findById(studentId);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');

        const studentGroups =
            await this.studentGroupRepository.findAllByStudentId(studentId);

        // Extraer periodos únicos de los grupos populados
        const periods = [
            ...new Set(
                studentGroups
                    .map((sg: any) => sg.groupId?.period)
                    .filter(Boolean),
            ),
        ].sort((a, b) => b.localeCompare(a)); // más reciente primero

        return { periods };
    }

    async getStudentReport(
        studentId: string,
        query: StudentReportQueryDto,
    ): Promise<StudentReportResponse> {
        if (!Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('ID de estudiante inválido.');
        }

        const student = await this.studentRepository.findById(studentId);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');

        // Obtener todos los grupos del estudiante en el periodo solicitado
        const allStudentGroups =
            await this.studentGroupRepository.findAllByStudentId(studentId);

        const groupsInPeriod = allStudentGroups.filter(
            (sg: any) => sg.groupId?.period === query.period,
        );

        const minThreshold = 80; // fallback global si el grupo no tiene threshold

        // Construir fila de asistencia por cada materia
        const subjects = await Promise.all(
            groupsInPeriod.map((sg: any) =>
                this.buildSubjectRow(
                    studentId,
                    sg.groupId,
                    sg.createdAt,
                    minThreshold,
                ),
            ),
        );

        return {
            profile: this.buildStudentProfile(student, query.period),
            totalGroups: subjects.length,
            subjects,
        };
    }

    private buildStudentProfile(
        student: any,
        period: string,
    ): StudentReportProfile {
        const age = this.calculateAge(student.birthday);

        return {
            studentId: student._id.toString(),
            name: student.name,
            lastName: student.lastName,
            email: student.email,
            documentNumber: student.documentNumber,
            phone: student.phone ?? null,
            age,
            career: student.career,
            photo: student.photo ?? null,
            period,
        };
    }

    private async buildSubjectRow(
        studentId: string,
        group: any,
        enrolledAt: Date,
        globalThreshold: number,
    ): Promise<SubjectAttendanceRow> {
        const groupId = group._id.toString();
        const threshold = this.normalizeThreshold(
            group.minAttendanceThreshold ?? globalThreshold,
        );

        // Obtener todas las sesiones cerradas del grupo
        const sessions =
            await this.attendanceRepository.findClosedByGroupId(groupId);

        if (sessions.length === 0) {
            return this.buildEmptySubjectRow(group, threshold);
        }

        // Filtrar sesiones que aplican al estudiante (regla de ingreso tardío)
        const enrolledDate = new Date(enrolledAt);
        const applicableSessions = sessions.filter(
            (s) => enrolledDate <= new Date(s.createdAt!),
        );

        if (applicableSessions.length === 0) {
            return this.buildEmptySubjectRow(group, threshold);
        }

        const sessionIds = applicableSessions.map((s) => s._id!.toString());

        // Obtener registros de asistencia del estudiante en esas sesiones
        const attendanceRecords =
            await this.studentAttendanceRepository.findByStudentAndAttendanceIds(
                studentId,
                sessionIds,
            );

        // Construir mapa sessionId → status para lookup O(1)
        const statusMap = new Map(
            attendanceRecords.map((r) => [
                r.attendanceId.toString(),
                STATUS_MAP[r.status] ?? 'A',
            ]),
        );

        let present = 0;
        let retarded = 0;
        let justified = 0;
        let absent = 0;

        for (const session of applicableSessions) {
            const status = statusMap.get(session._id!.toString()) ?? null;
            if (status === 'P') present++;
            else if (status === 'R') retarded++;
            else if (status === 'J') justified++;
            else absent++; // null y 'A' = ausente
        }

        const percentage = this.calculatePercentage(
            present,
            retarded,
            justified,
            applicableSessions.length,
        );

        return {
            groupId,
            subject: group.subject,
            referenceCode: group.referenceCode,
            present: present + retarded + justified,
            absent,
            totalSessions: applicableSessions.length,
            percentage,
            status: this.resolveAttendanceStatus(percentage, threshold),
        };
    }

    private buildEmptySubjectRow(
        group: any,
        threshold: number,
    ): SubjectAttendanceRow {
        return {
            groupId: group._id.toString(),
            subject: group.subject,
            referenceCode: group.referenceCode,
            present: 0,
            absent: 0,
            totalSessions: 0,
            percentage: 0,
            status: this.resolveAttendanceStatus(0, threshold),
        };
    }

    private calculateAge(birthday: Date): number {
        const today = new Date();
        const birth = new Date(birthday);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    }
}
