// create-student.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsDateString,
    Matches,
    IsMongoId,
    IsOptional,
    Max,
    IsInt,
    Min,
    IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';

export class GetStudentsQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    offset?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    documentNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    career?: string;
}

export class CreateStudentDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty() @IsString() lastName: string;
    @ApiProperty() @IsEmail() email: string;
    @ApiProperty() @IsString() documentNumber: string;
    @ApiProperty() @IsDateString() birthday: string;
    @ApiProperty() @IsString() career: string;

    @ApiProperty()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(12)
    semester: number;

    @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    residentialAddress?: string;

    // ← agregar esto
    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    @IsOptional()
    photo?: any;
}

export class UpdateStudentDto {
    @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
    @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() documentNumber?: string;
    @ApiPropertyOptional() @IsOptional() @IsDateString() birthday?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() career?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) =>
        value !== undefined ? parseInt(value) : undefined,
    )
    @IsInt()
    @Min(1)
    @Max(12)
    semester?: number;

    @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    residentialAddress?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    removePhoto?: boolean;
}

export class RegisterFaceDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    photo: any;
}
