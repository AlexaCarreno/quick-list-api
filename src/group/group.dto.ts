import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsMongoId, IsString } from 'class-validator';

import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsNumber,
    IsOptional,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { DayOfWeek, GroupStatus, Shift } from './group.interface';

export class ScheduleDto {
    @ApiProperty({
        enum: DayOfWeek,
    })
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @ApiProperty({ example: '6:00' })
    @IsString()
    startTime: string;

    @ApiProperty({ example: '7:30' })
    @IsString()
    endTime: string;

    @ApiProperty({ enum: Shift })
    @IsEnum(Shift)
    shift: Shift;
}

export class CreateGroupDto {
    @ApiProperty() @IsString() referenceCode: string;
    @ApiProperty() @IsString() subject: string;
    @ApiProperty() @IsString() color: string;
    @ApiProperty() @IsString() period: string;

    @ApiProperty() @IsDateString() startDate: string;
    @ApiProperty() @IsDateString() endDate: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    @Max(1)
    minAttendanceThreshold?: number;

    @ApiPropertyOptional({ type: [ScheduleDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDto)
    schedules?: ScheduleDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId()
    teacherId?: string;
}

export class UpdateGroupDto {
    @ApiPropertyOptional() @IsOptional() @IsString() referenceCode?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() subject?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() period?: string;

    @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
    @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;

    @ApiPropertyOptional({ enum: GroupStatus })
    @IsOptional()
    @IsEnum(GroupStatus)
    status?: GroupStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    @Max(1)
    minAttendanceThreshold?: number;

    @ApiPropertyOptional({ type: [ScheduleDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDto)
    schedules?: ScheduleDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId()
    teacherId?: string;
}

export class GetGroupsQueryDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    limit?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    offset?: number;

    @IsOptional() @IsString() referenceCode?: string;
    @IsOptional() @IsString() subject?: string;
    @IsOptional() @IsString() period?: string;
    @IsOptional() @IsEnum(GroupStatus) status?: GroupStatus;
}
