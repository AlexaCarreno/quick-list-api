import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches
} from 'class-validator';

export class GroupReportQueryDto {
    @ApiPropertyOptional({
        description: 'Mes a consultar (YYYY-MM). Exclusivo con from/to.',
        example: '2026-03',
    })
    @IsOptional()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'El mes debe tener formato YYYY-MM',
    })
    month?: string;

    @ApiPropertyOptional({
        description: 'Fecha inicio del rango (ISO 8601). Exclusivo con month.',
        example: '2026-02-01',
    })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({
        description: 'Fecha fin del rango (ISO 8601). Exclusivo con month.',
        example: '2026-03-31',
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
