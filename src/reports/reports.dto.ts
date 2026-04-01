import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';

export class GroupReportQueryDto {
    @ApiPropertyOptional({
        description: 'Fecha inicio del filtro (ISO 8601)',
        example: '2025-02-01',
    })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({
        description: 'Fecha fin del filtro (ISO 8601)',
        example: '2025-03-31',
    })
    @IsOptional()
    @IsDateString()
    to?: string;
}

export class StudentReportQueryDto {
    @ApiProperty({
        description: 'Periodo académico',
        example: '2026-1',
    })
    @IsString()
    @IsNotEmpty()
    period: string;
}
