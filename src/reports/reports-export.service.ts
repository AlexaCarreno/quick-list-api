import { Injectable } from "@nestjs/common";
import * as ExcelJS from 'exceljs';
import { GroupReportResponse, StudentReportResponse } from "./reports.interface";

const COLORS = {
    P: { bg: 'FFE2EFDA', font: 'FF375623' },
    A: { bg: 'FFFCE4D6', font: 'FF9C0006' },
    R: { bg: 'FFFFF2CC', font: 'FF7F4F00' },
    J: { bg: 'FFDEEAF1', font: 'FF1F4E79' },
    NA: { bg: 'FFEDEDED', font: 'FF666666' },

    approved: { bg: 'FFE2EFDA', font: 'FF375623' },
    at_risk: { bg: 'FFFFF2CC', font: 'FF7F4F00' },
    critical: { bg: 'FFFCE4D6', font: 'FF9C0006' },

    headerDark: { bg: 'FF1F4E79', font: 'FFFFFFFF' },
    headerMedium: { bg: 'FF2E75B6', font: 'FFFFFFFF' },
    headerLight: { bg: 'FFDEEAF1', font: 'FF1F4E79' },
    rowOdd: { bg: 'FFFFFFFF', font: 'FF000000' },
    rowEven: { bg: 'FFF2F2F2', font: 'FF000000' },
    averageRow: { bg: 'FF1F4E79', font: 'FFFFFFFF' },
    metricsBg: { bg: 'FFDEEAF1', font: 'FF1F4E79' },
};

const BORDER_COLOR = 'FFB8CCE4';

@Injectable()
export class ReportsExportService {

    async generateGroupReportXlsx(
        report: GroupReportResponse,
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'QuickList';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Reporte de Asistencia', {
            pageSetup: {
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                paperSize: 9,
            },
            views: [{ state: 'normal' }],
        });

        const {
            group,
            metrics,
            sessionsByMonth,
            allSessions,
            students,
            sessionAverages,
        } = report;

        // ── Layout de columnas ───────────────────────────────────────────────
        const SESSION_COL_START = 3;
        const totalSessionCols = allSessions.length;
        const SUMMARY_COL_START = SESSION_COL_START + totalSessionCols;
        const ESTADO_COL = SUMMARY_COL_START + 3;
        const totalCols = ESTADO_COL;

        // ── Anchos de columna ────────────────────────────────────────────────
        sheet.getColumn(1).width = 32;
        sheet.getColumn(2).width = 18;
        for (let i = 0; i < totalSessionCols; i++) {
            sheet.getColumn(SESSION_COL_START + i).width = 9;
        }
        sheet.getColumn(SUMMARY_COL_START).width = 13;
        sheet.getColumn(SUMMARY_COL_START + 1).width = 12;
        sheet.getColumn(SUMMARY_COL_START + 2).width = 9;
        sheet.getColumn(ESTADO_COL).width = 14;

        // ── Fila 1: Título ───────────────────────────────────────────────────
        sheet.mergeCells(1, 1, 1, totalCols);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = `Registro de Asistencia — ${group.subject} (${group.referenceCode})`;
        this.styleCell(titleCell, {
            ...COLORS.headerDark,
            fontSize: 14,
            bold: true,
            alignment: 'center',
        });
        sheet.getRow(1).height = 30;

        // ── Fila 2: Subtítulo ────────────────────────────────────────────────
        sheet.mergeCells(2, 1, 2, totalCols);
        const subtitleCell = sheet.getCell(2, 1);
        subtitleCell.value =
            `Periodo: ${group.period}   |   ` +
            `Umbral mínimo de asistencia: ${group.minAttendanceThreshold}%   |   ` +
            `Generado: ${new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}`;
        this.styleCell(subtitleCell, {
            ...COLORS.headerMedium,
            fontSize: 10,
            bold: false,
            alignment: 'center',
        });
        sheet.getRow(2).height = 18;

        // ── Fila 3: Métricas en una sola celda ───────────────────────────────
        sheet.mergeCells(3, 1, 3, totalCols);
        const metricsCell = sheet.getCell(3, 1);
        metricsCell.value =
            `Total estudiantes: ${metrics.totalStudents}     |     ` +
            `Promedio grupal: ${metrics.groupAverage}%     |     ` +
            `Sesiones tomadas: ${metrics.totalSessions}     |     ` +
            `En riesgo: ${metrics.studentsAtRisk}`;
        this.styleCell(metricsCell, {
            ...COLORS.metricsBg,
            fontSize: 10,
            bold: true,
            alignment: 'center',
        });
        sheet.getRow(3).height = 22;

        // ── Fila 4: Separador ────────────────────────────────────────────────
        sheet.mergeCells(4, 1, 4, totalCols);
        sheet.getCell(4, 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.headerDark.bg },
        };
        sheet.getRow(4).height = 4;

        // ── Fila 5: Encabezados de mes + columnas de resumen ─────────────────
        sheet.mergeCells(5, 1, 6, 1);
        this.styleCell(sheet.getCell(5, 1), {
            ...COLORS.headerDark,
            fontSize: 10,
            bold: true,
            alignment: 'center',
        });
        sheet.getCell(5, 1).value = 'ESTUDIANTE';

        sheet.mergeCells(5, 2, 6, 2);
        this.styleCell(sheet.getCell(5, 2), {
            ...COLORS.headerDark,
            fontSize: 10,
            bold: true,
            alignment: 'center',
        });
        sheet.getCell(5, 2).value = 'DOCUMENTO';

        // Encabezados de mes agrupados
        let currentCol = SESSION_COL_START;
        for (const monthGroup of sessionsByMonth) {
            const colStart = currentCol;
            const colEnd = currentCol + monthGroup.sessions.length - 1;

            if (colStart < colEnd) {
                sheet.mergeCells(5, colStart, 5, colEnd);
            }
            const monthCell = sheet.getCell(5, colStart);
            monthCell.value = monthGroup.month;
            this.styleCell(monthCell, {
                ...COLORS.headerMedium,
                fontSize: 10,
                bold: true,
                alignment: 'center',
            });

            currentCol += monthGroup.sessions.length;
        }

        // Encabezado RESUMEN
        sheet.mergeCells(5, SUMMARY_COL_START, 5, ESTADO_COL);
        const resumenCell = sheet.getCell(5, SUMMARY_COL_START);
        resumenCell.value = 'RESUMEN';
        this.styleCell(resumenCell, {
            ...COLORS.headerDark,
            fontSize: 10,
            bold: true,
            alignment: 'center',
        });

        sheet.getRow(5).height = 20;

        // ── Fila 6: Sub-encabezados de sesiones y resumen ────────────────────
        allSessions.forEach((session, idx) => {
            const cell = sheet.getCell(6, SESSION_COL_START + idx);
            cell.value = session.dayLabel;
            this.styleCell(cell, {
                ...COLORS.headerLight,
                fontSize: 9,
                bold: true,
                alignment: 'center',
            });
        });

        const summaryHeaders = ['PRESENTE', 'AUSENTE', '%', 'ESTADO'];
        summaryHeaders.forEach((label, idx) => {
            const cell = sheet.getCell(6, SUMMARY_COL_START + idx);
            cell.value = label;
            this.styleCell(cell, {
                ...COLORS.headerLight,
                fontSize: 9,
                bold: true,
                alignment: 'center',
            });
        });

        sheet.getRow(6).height = 18;

        // ── Filas de estudiantes ─────────────────────────────────────────────
        students.forEach((student, rowIdx) => {
            const rowNum = 7 + rowIdx;
            const rowColors = rowIdx % 2 === 0 ? COLORS.rowOdd : COLORS.rowEven;

            const nameCell = sheet.getCell(rowNum, 1);
            nameCell.value = `${student.name} ${student.lastName}`;
            this.styleCell(nameCell, {
                ...rowColors,
                fontSize: 10,
                bold: false,
                alignment: 'left',
            });

            const docCell = sheet.getCell(rowNum, 2);
            docCell.value = student.documentNumber;
            this.styleCell(docCell, {
                ...rowColors,
                fontSize: 9,
                bold: false,
                alignment: 'center',
            });

            allSessions.forEach((session, idx) => {
                const col = SESSION_COL_START + idx;
                const status = student.attendanceMap[session.sessionId];
                const cell = sheet.getCell(rowNum, col);

                const colorKey = status === 'N/A' ? 'NA' : status ?? 'A';
                const color = COLORS[colorKey as keyof typeof COLORS] as {
                    bg: string;
                    font: string;
                };

                cell.value = status === 'N/A' ? '—' : (status ?? 'A');
                this.styleCell(cell, {
                    bg: color.bg,
                    font: color.font,
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                });
            });

            const { present, absent, percentage, status } = student.summary;
            const statusColor = COLORS[status] as { bg: string; font: string };

            [present, absent, `${percentage}%`].forEach((val, idx) => {
                const cell = sheet.getCell(rowNum, SUMMARY_COL_START + idx);
                cell.value = val;
                this.styleCell(cell, {
                    ...rowColors,
                    fontSize: 10,
                    bold: false,
                    alignment: 'center',
                });
            });

            const estadoCell = sheet.getCell(rowNum, ESTADO_COL);
            estadoCell.value = this.statusLabel(status);
            this.styleCell(estadoCell, {
                bg: statusColor.bg,
                font: statusColor.font,
                fontSize: 9,
                bold: true,
                alignment: 'center',
            });

            sheet.getRow(rowNum).height = 18;
        });

        // ── Fila de promedios por sesión ─────────────────────────────────────
        const averageRowNum = 7 + students.length;

        sheet.mergeCells(averageRowNum, 1, averageRowNum, 2);
        const avgLabelCell = sheet.getCell(averageRowNum, 1);
        avgLabelCell.value = 'PROMEDIO POR SESIÓN';
        this.styleCell(avgLabelCell, {
            ...COLORS.averageRow,
            fontSize: 9,
            bold: true,
            alignment: 'center',
        });

        allSessions.forEach((session, idx) => {
            const cell = sheet.getCell(averageRowNum, SESSION_COL_START + idx);
            cell.value = `${sessionAverages[session.sessionId] ?? 0}%`;
            this.styleCell(cell, {
                ...COLORS.averageRow,
                fontSize: 9,
                bold: true,
                alignment: 'center',
            });
        });

        sheet.mergeCells(
            averageRowNum,
            SUMMARY_COL_START,
            averageRowNum,
            SUMMARY_COL_START + 1,
        );
        const promLabelCell = sheet.getCell(averageRowNum, SUMMARY_COL_START);
        promLabelCell.value = 'Promedio acumulado';
        this.styleCell(promLabelCell, {
            ...COLORS.averageRow,
            fontSize: 9,
            bold: true,
            alignment: 'right',
        });

        const cumCell = sheet.getCell(averageRowNum, SUMMARY_COL_START + 2);
        cumCell.value = `${report.cumulativeAverage}%`;
        this.styleCell(cumCell, {
            ...COLORS.averageRow,
            fontSize: 11,
            bold: true,
            alignment: 'center',
        });

        this.styleCell(sheet.getCell(averageRowNum, ESTADO_COL), {
            ...COLORS.averageRow,
            fontSize: 9,
            bold: false,
            alignment: 'center',
        });

        sheet.getRow(averageRowNum).height = 20;

        // ── Leyenda ──────────────────────────────────────────────────────────
        const legendRowNum = averageRowNum + 2;
        sheet.mergeCells(legendRowNum, 1, legendRowNum, totalCols);
        const legendCell = sheet.getCell(legendRowNum, 1);
        legendCell.value =
            'P = Presente   |   A = Ausente   |   R = Retardo (cuenta como 0.5)   |   J = Justificado   |   — = No aplica (estudiante vinculado después de la sesión)';
        this.styleCell(legendCell, {
            bg: 'FFFFF9F0',
            font: 'FF7F4F00',
            fontSize: 8,
            bold: false,
            alignment: 'left',
        });
        sheet.getRow(legendRowNum).height = 14;

        // ── Bordes ───────────────────────────────────────────────────────────
        for (let row = 5; row <= averageRowNum; row++) {
            for (let col = 1; col <= totalCols; col++) {
                sheet.getCell(row, col).border = {
                    top: { style: 'thin', color: { argb: BORDER_COLOR } },
                    left: { style: 'thin', color: { argb: BORDER_COLOR } },
                    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
                    right: { style: 'thin', color: { argb: BORDER_COLOR } },
                };
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }


    async generateStudentReportXlsx(
        report: StudentReportResponse,
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'QuickList';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Reporte Estudiante', {
            pageSetup: {
                orientation: 'portrait',
                fitToPage: true,
                fitToWidth: 1,
                paperSize: 9,
            },
            views: [{ state: 'normal' }],
        });

        const { profile, totalGroups, subjects } = report;

        const totalCols = 7;

        // ── Fila 1: Título ───────────────────────────────────────────────────
        sheet.mergeCells(1, 1, 1, totalCols);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = `Reporte de Asistencia — ${profile.name} ${profile.lastName}`;
        this.styleCell(titleCell, {
            ...COLORS.headerDark,
            fontSize: 14,
            bold: true,
            alignment: 'center',
        });
        sheet.getRow(1).height = 30;

        // ── Fila 2: Subtítulo ────────────────────────────────────────────────
        sheet.mergeCells(2, 1, 2, totalCols);
        const subtitleCell = sheet.getCell(2, 1);
        subtitleCell.value =
            `Periodo: ${profile.period}   |   ` +
            `Generado: ${new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}`;
        this.styleCell(subtitleCell, {
            ...COLORS.headerMedium,
            fontSize: 10,
            bold: false,
            alignment: 'center',
        });
        sheet.getRow(2).height = 18;

        // ── Fila 3: Separador ────────────────────────────────────────────────
        sheet.mergeCells(3, 1, 3, totalCols);
        sheet.getCell(3, 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.headerDark.bg },
        };
        sheet.getRow(3).height = 4;

        // ── Filas 4-7: Perfil del estudiante ─────────────────────────────────
        const profileData = [
            ['Documento', profile.documentNumber, 'Carrera', profile.career],
            ['Email', profile.email, 'Teléfono', profile.phone ?? '—'],
            ['Edad', `${profile.age} años`, 'Materias', String(totalGroups)],
        ];

        profileData.forEach((row, rowIdx) => {
            const rowNum = 4 + rowIdx;

            // Label 1
            const labelCell1 = sheet.getCell(rowNum, 1);
            labelCell1.value = row[0];
            this.styleCell(labelCell1, {
                ...COLORS.headerLight,
                fontSize: 9,
                bold: true,
                alignment: 'right',
            });

            // Value 1
            sheet.mergeCells(rowNum, 2, rowNum, 3);
            const valueCell1 = sheet.getCell(rowNum, 2);
            valueCell1.value = row[1];
            this.styleCell(valueCell1, {
                ...COLORS.rowOdd,
                fontSize: 10,
                bold: false,
                alignment: 'left',
            });

            // Label 2
            const labelCell2 = sheet.getCell(rowNum, 4);
            labelCell2.value = row[2];
            this.styleCell(labelCell2, {
                ...COLORS.headerLight,
                fontSize: 9,
                bold: true,
                alignment: 'right',
            });

            // Value 2
            sheet.mergeCells(rowNum, 5, rowNum, totalCols);
            const valueCell2 = sheet.getCell(rowNum, 5);
            valueCell2.value = row[3];
            this.styleCell(valueCell2, {
                ...COLORS.rowOdd,
                fontSize: 10,
                bold: false,
                alignment: 'left',
            });

            sheet.getRow(rowNum).height = 18;
        });

        // ── Fila 7: Separador ────────────────────────────────────────────────
        sheet.mergeCells(7, 1, 7, totalCols);
        sheet.getCell(7, 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.headerDark.bg },
        };
        sheet.getRow(7).height = 4;

        // ── Fila 8: Encabezados de tabla ─────────────────────────────────────
        const headers = ['MATERIA', 'CÓDIGO', 'ASISTENCIAS', 'FALTAS', 'SESIONES', '%', 'ESTADO'];
        headers.forEach((label, idx) => {
            const cell = sheet.getCell(8, idx + 1);
            cell.value = label;
            this.styleCell(cell, {
                ...COLORS.headerDark,
                fontSize: 10,
                bold: true,
                alignment: 'center',
            });
        });
        sheet.getRow(8).height = 20;

        // ── Filas de materias ────────────────────────────────────────────────
        subjects.forEach((subject, rowIdx) => {
            const rowNum = 9 + rowIdx;
            const rowColors = rowIdx % 2 === 0 ? COLORS.rowOdd : COLORS.rowEven;
            const statusColor = COLORS[subject.status] as { bg: string; font: string };

            const cells: [number, string | number, typeof rowColors, 'left' | 'center'][] = [
                [1, subject.subject, rowColors, 'left'],
                [2, subject.referenceCode, rowColors, 'center'],
                [3, subject.present, rowColors, 'center'],
                [4, subject.absent, rowColors, 'center'],
                [5, subject.totalSessions, rowColors, 'center'],
                [6, `${subject.percentage}%`, rowColors, 'center'],
            ];

            cells.forEach(([col, value, colors, alignment]) => {
                const cell = sheet.getCell(rowNum, col);
                cell.value = value;
                this.styleCell(cell, {
                    ...colors,
                    fontSize: 10,
                    bold: false,
                    alignment,
                });
            });

            // Estado con color semántico
            const estadoCell = sheet.getCell(rowNum, 7);
            estadoCell.value = this.statusLabel(subject.status);
            this.styleCell(estadoCell, {
                bg: statusColor.bg,
                font: statusColor.font,
                fontSize: 9,
                bold: true,
                alignment: 'center',
            });

            sheet.getRow(rowNum).height = 18;
        });

        // ── Fila de totales ──────────────────────────────────────────────────
        const totalsRowNum = 9 + subjects.length;
        const totalPresent = subjects.reduce((acc, s) => acc + s.present, 0);
        const totalAbsent = subjects.reduce((acc, s) => acc + s.absent, 0);
        const totalSessions = subjects.reduce((acc, s) => acc + s.totalSessions, 0);
        const globalPct = totalSessions > 0
            ? Math.round((totalPresent / totalSessions) * 100)
            : 0;

        sheet.mergeCells(totalsRowNum, 1, totalsRowNum, 2);
        const totalsLabelCell = sheet.getCell(totalsRowNum, 1);
        totalsLabelCell.value = 'TOTALES';
        this.styleCell(totalsLabelCell, {
            ...COLORS.averageRow,
            fontSize: 10,
            bold: true,
            alignment: 'center',
        });

        [totalPresent, totalAbsent, totalSessions, `${globalPct}%`].forEach((val, idx) => {
            const cell = sheet.getCell(totalsRowNum, 3 + idx);
            cell.value = val;
            this.styleCell(cell, {
                ...COLORS.averageRow,
                fontSize: 10,
                bold: true,
                alignment: 'center',
            });
        });

        // celda estado vacía en totales
        this.styleCell(sheet.getCell(totalsRowNum, 7), {
            ...COLORS.averageRow,
            fontSize: 9,
            bold: false,
            alignment: 'center',
        });

        sheet.getRow(totalsRowNum).height = 20;

        // ── Anchos de columna ────────────────────────────────────────────────
        sheet.getColumn(1).width = 28; // Materia
        sheet.getColumn(2).width = 12; // Código
        sheet.getColumn(3).width = 14; // Asistencias
        sheet.getColumn(4).width = 10; // Faltas
        sheet.getColumn(5).width = 12; // Sesiones
        sheet.getColumn(6).width = 8;  // %
        sheet.getColumn(7).width = 14; // Estado

        // ── Bordes ───────────────────────────────────────────────────────────
        for (let row = 8; row <= totalsRowNum; row++) {
            for (let col = 1; col <= totalCols; col++) {
                sheet.getCell(row, col).border = {
                    top: { style: 'thin', color: { argb: BORDER_COLOR } },
                    left: { style: 'thin', color: { argb: BORDER_COLOR } },
                    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
                    right: { style: 'thin', color: { argb: BORDER_COLOR } },
                };
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private styleCell(
        cell: ExcelJS.Cell,
        options: {
            bg: string;
            font: string;
            fontSize: number;
            bold: boolean;
            alignment: 'center' | 'left' | 'right';
            wrapText?: boolean;
        },
    ) {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: options.bg },
        };
        cell.font = {
            color: { argb: options.font },
            size: options.fontSize,
            bold: options.bold,
            name: 'Calibri',
        };
        cell.alignment = {
            vertical: 'middle',
            horizontal: options.alignment,
            wrapText: options.wrapText ?? false,
        };
    }

    private statusLabel(
        status: 'approved' | 'at_risk' | 'critical',
    ): string {
        return {
            approved: 'Aprobado',
            at_risk: 'En riesgo',
            critical: 'Crítico',
        }[status];
    }
}