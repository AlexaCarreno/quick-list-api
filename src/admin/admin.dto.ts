import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    MinLength,
} from 'class-validator';

export class GetAdminsQueryDto {
    @ApiPropertyOptional({
        example: 0,
        description: 'Número de registros a omitir',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({
        example: 10,
        description: 'Cantidad de registros a retornar',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nameContains?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    emailContains?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    documentNumberContains?: string;
}

export class UpdateAdminDto {
    // Campos de User
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    birthday?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    changePassword?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    removePhoto?: boolean;

    // Campos de Admin
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    documentNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    residentialAddress?: string;

    @ApiPropertyOptional({ example: 'Coordinador académico' })
    @IsOptional()
    @IsString()
    position?: string;

    @ApiPropertyOptional({ example: 'Rectoría' })
    @IsOptional()
    @IsString()
    department?: string;
}
