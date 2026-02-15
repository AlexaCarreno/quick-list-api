import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        type: 'string',
        name: 'email',
        required: true,
        example: 'example@email.co',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        type: 'string',
        name: 'password',
        required: true,
        example: 'a_password',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: '<refresh_token>' })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
