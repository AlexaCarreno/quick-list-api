// create-student.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsDateString,
    Matches,
    IsMongoId,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateStudentDto {
    @ApiProperty({ description: 'DNI del estudiante', example: '123456789' })
    @IsString()
    @IsNotEmpty()
    dni: string;

    @ApiProperty({ description: 'Nombre del estudiante', example: 'Juan' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Apellido del estudiante', example: 'Pérez' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ description: 'Fecha de nacimiento', example: '2005-05-15' })
    @IsDateString()
    birthday: Date;

    @ApiProperty({
        description: 'Correo electrónico',
        example: 'juan@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Número de teléfono', example: '3001234567' })
    @IsString()
    @Matches(/^[0-9]{7,15}$/)
    phone: string;
}

// create-student-with-image.dto.ts
export class CreateStudentWithImageDto extends CreateStudentDto {
    @ApiProperty({
        description: 'Imagen del estudiante',
        type: 'string',
        format: 'binary',
    })
    image: any;
}

export class DeleteStudentsDto {
    @ApiProperty({
        description: 'Identificadores de estudiantes a eliminar',
        type: 'array',
        format: 'objectId',
        example: [new Types.ObjectId()],
    })
    @IsString({ each: true })
    studentIds: string[];
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
    @ApiPropertyOptional({
        description: 'URL o nombre de la imagen del estudiante',
        type: 'string',
    })
    @IsOptional()
    @IsString()
    image?: string;
}
