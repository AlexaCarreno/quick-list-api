import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';
import { StudentAttendanceStatus } from './student-attendance.interface';

export class UpdateStudentAttendanceDto {
    @ApiProperty({ enum: StudentAttendanceStatus })
    @IsEnum(StudentAttendanceStatus)
    status: StudentAttendanceStatus;
}

export class RecognizeFaceDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    photo: any;
}

export class GetStudentAttendancesQueryDto {
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

    @ApiPropertyOptional({ enum: StudentAttendanceStatus })
    @IsOptional()
    @IsEnum(StudentAttendanceStatus)
    status?: StudentAttendanceStatus;
}

export class InitAttendanceDto {
    @ApiProperty()
    @IsMongoId()
    groupId: string;
}
