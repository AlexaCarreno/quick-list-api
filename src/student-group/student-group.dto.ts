import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsString } from 'class-validator';

export class AddStudentToGroupDto {
    @ApiProperty()
    @IsMongoId()
    studentId: string;
}

export class GetGroupStudentsQueryDto {
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
    documentNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    career?: string;
}
