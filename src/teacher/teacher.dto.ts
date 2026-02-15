import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class GetTeachersQueryDto {
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

    // Filtro por email del usuario base
    @ApiPropertyOptional({ example: 'docente@mail.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    // Opcional: búsqueda parcial
    @ApiPropertyOptional({
        example: 'gmail.com',
        description: 'Búsqueda parcial por email',
    })
    @IsOptional()
    @IsString()
    emailContains?: string;
}
