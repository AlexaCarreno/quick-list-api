import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    MaxLength,
    MinLength,
} from 'class-validator';

export class SignupStep1Dto {
    @ApiProperty({ example: '<Name_example>' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.toUpperCase() : value,
    )
    name: string;

    @ApiProperty({ example: '<lastName_example>' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.toUpperCase() : value,
    )
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    @Transform(({ value }) =>
        typeof value === 'string' ? new Date(value) : value,
    )
    birthdate: Date;

    @ApiProperty({ example: '<email@example.co>' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.toLowerCase() : value,
    )
    email: string;

    @ApiProperty({ example: '<Password_example>' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(255)
    password: string;
}

export class SignupStep2Dto {
    @ApiProperty({ example: '<email@example.co>' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.toLowerCase() : value,
    )
    email: string;

    @ApiProperty({ example: '<verification_code_example>' })
    @IsNotEmpty()
    @IsString()
    @Length(6)
    code: string;
}

export class EmailDto {
    @ApiProperty({ example: '<email@example.co>' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.toLowerCase() : value,
    )
    email: string;
}
