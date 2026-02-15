import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Put,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import {
    CreateStudentDto,
    CreateStudentWithImageDto,
    DeleteStudentsDto,
} from './students.dto';
import { IStudent } from './students.interface';
import { StudentsService } from './students.service';

@Controller('group/:groupId/students')
export class StudentsController {
    constructor(private readonly studentService: StudentsService) {}

    @Get()
    async findAll(@Param('groupId') groupId: string): Promise<IStudent[]> {
        return this.studentService.getAllStudents(groupId);
    }

    @Get('/:id')
    async findOne(@Param('id') id: string): Promise<IStudent> {
        return this.studentService.getStudentById(id);
    }

    @Post('/')
    @ApiBearerAuth('accessToken')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos estudiante + imagen',
        type: CreateStudentWithImageDto,
    })
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
        }),
    )
    async create(
        @Param('groupId') groupId: string,
        @Body() body: CreateStudentDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                ],
            }),
        )
        file: Express.Multer.File,
    ): Promise<IStudent> {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        return await this.studentService.createStudent(
            groupId,
            { ...body },
            file,
        );
    }

    @Put('/:id')
    @ApiBearerAuth('accessToken')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description:
            'Datos del estudiante a actualizar (opcionalmente con nueva imagen)',
        type: CreateStudentWithImageDto,
    })
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
        }),
    )
    async update(
        @Param('groupId') groupId: string,
        @Param('id') id: string,
        @Body() body: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                ],
                fileIsRequired: false, // 👈 permite actualizar sin subir imagen
            }),
        )
        file?: Express.Multer.File,
    ): Promise<IStudent> {
        return await this.studentService.updateStudent(groupId, id, body, file);
    }

    @Delete('/')
    @HttpCode(HttpStatus.OK)
    async remove(
        @Param('groupId') groupId: string,
        @Body() { studentIds }: DeleteStudentsDto,
    ) {
        const { deleteds } = await this.studentService.deleteStudent(
            groupId,
            studentIds,
        );

        return { deleteds };
    }
}
