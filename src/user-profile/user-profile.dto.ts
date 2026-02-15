import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateTeacherDto {
    // User fields
    @ApiProperty({ example: '69852a854d753d27d9d5627b' })
    @IsMongoId()
    roleId: string;

    @ApiProperty({ example: 'Angie Alexandra' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Carreño Bayona' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: '1007438902' })
    @IsString()
    documentNumber: string;

    @ApiProperty({ example: '2004-04-12' })
    @IsDateString()
    birthday: string;

    @ApiProperty({ example: 'correo@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password_example' })
    @IsBoolean()
    @Type(() => Boolean)
    changePassword: boolean;

    @ApiProperty({ example: 'password_example' })
    @IsString()
    password: string;

    @ApiProperty({ example: 'Cra 15 #16-05' })
    @IsString()
    residentialAddress: string;

    @ApiProperty({ example: 'Ingeniero de Sistemas' })
    @IsString()
    professionalTitle: string;

    @ApiProperty({ example: '1234643135', required: false })
    @IsOptional()
    @IsString()
    professionalLicenseNumber?: string;

    // File
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false,
    })
    @IsOptional()
    photo?: any;
}
