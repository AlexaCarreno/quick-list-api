import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';
import { AttendanceStatus } from './attendance.interface';

export class CreateAttendanceDto {
    @ApiProperty() @IsMongoId() groupId: string;
    @ApiProperty() @IsString() startTime: string;
    @ApiProperty() @IsString() endTime: string;
    @ApiProperty({ enum: ['AM', 'PM'] }) @IsEnum(['AM', 'PM']) shift: string;
    @ApiProperty() @IsDateString() date: string;
}

export class GetAttendancesQueryDto {
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
    @IsEnum(AttendanceStatus)
    status?: AttendanceStatus;
}
