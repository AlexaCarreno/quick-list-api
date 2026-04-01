export interface SessionCell {
    sessionId: string;
    status: 'P' | 'A' | 'R' | 'J' | null;
}

export interface StudentReportRow {
    studentId: string;
    name: string;
    lastName: string;
    documentNumber: string;
    attendanceMap: Record<string, 'P' | 'A' | 'R' | 'J' | 'N/A' | null>;
    summary: {
        present: number;
        absent: number;
        retarded: number;
        justified: number;
        applicableSessions: number;
        percentage: number;
        status: 'approved' | 'at_risk' | 'critical';
    };
}

export interface SessionSummary {
    sessionId: string;
    date: Date;
    startTimestamp: Date;
    dayLabel: string; // "2 Lun"
    month: string; // "FEBRERO 2025"
}

export interface SessionsByMonth {
    month: string;
    sessions: SessionSummary[];
}

export interface GroupReportResponse {
    group: {
        id: string;
        subject: string;
        referenceCode: string;
        period: string;
        minAttendanceThreshold: number;
    };
    metrics: {
        totalStudents: number;
        groupAverage: number;
        totalSessions: number;
        studentsAtRisk: number;
    };
    sessionsByMonth: SessionsByMonth[];
    allSessions: SessionSummary[];
    students: StudentReportRow[];
    sessionAverages: Record<string, number>; // sessionId -> % presentes
    cumulativeAverage: number;
}

// students
export interface StudentReportProfile {
    studentId: string;
    name: string;
    lastName: string;
    email: string;
    documentNumber: string;
    phone: string | null;
    age: number;
    career: string;
    photo: string | null;
    period: string;
}

export interface SubjectAttendanceRow {
    groupId: string;
    subject: string;
    referenceCode: string;
    present: number;
    absent: number;
    totalSessions: number;
    percentage: number;
    status: 'approved' | 'at_risk' | 'critical';
}

export interface StudentReportResponse {
    profile: StudentReportProfile;
    totalGroups: number;
    subjects: SubjectAttendanceRow[];
}

export interface StudentPeriodsResponse {
    periods: string[];
}
