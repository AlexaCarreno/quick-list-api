import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { GroupStatus } from './group.interface';

export class CreateGroupDto {
    @ApiProperty({ example: 'Unidades Tecgnologicas de Santander' })
    @IsString()
    @IsNotEmpty()
    institutionName: string;

    @ApiProperty({ example: 'Arquitectura de software' })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ example: 'E-195' })
    @IsString()
    @IsNotEmpty()
    referenceCode: string;
}

export class GroupIdDto {
    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    groupId: string;
}

export class UpdateGroupDto {
    @ApiProperty({ example: 'Institution name' })
    @IsString()
    @IsNotEmpty()
    institutionName: string;

    @ApiProperty({ example: 'Subject name' })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ example: 'reference code' })
    @IsString()
    @IsNotEmpty()
    referenceCode: string;
}

export class StatusDto {
    @ApiProperty({ enum: GroupStatus })
    @IsEnum(GroupStatus)
    status: GroupStatus;
}
