import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import { imageFileFilter } from '../common/utils/file-filter';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import {
    CreateStudentDto,
    GetStudentsQueryDto,
    RegisterFaceDto,
    UpdateStudentDto,
} from './students.dto';
import { StudentService } from './students.service';

@ApiTags('Students')
@Controller('students')
export class StudentController {
    constructor(private readonly studentService: StudentService) {}

    @Get()
    @AuthPermissions(ResourceType.USERS, ActionType.READ, [RoleName.ADMIN])
    async findAll(@Query() query: GetStudentsQueryDto) {
        return await this.studentService.findAll(query);
    }

    @Get(':id')
    @AuthPermissions(ResourceType.USERS, ActionType.READ, [RoleName.ADMIN])
    async findOne(@Param('id') id: string) {
        return await this.studentService.findById(id);
    }

    @Post()
    @AuthPermissions(ResourceType.USERS, ActionType.CREATE, [RoleName.ADMIN])
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 3 * 1024 * 1024 },
            fileFilter: imageFileFilter,
        }),
    )
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateStudentDto,
    ) {
        return await this.studentService.create(body, file);
    }

    @Patch(':id')
    @AuthPermissions(ResourceType.USERS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 3 * 1024 * 1024 },
        }),
    )
    async update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UpdateStudentDto,
    ) {
        return await this.studentService.update(id, body, file);
    }

    @Patch(':id/toggle-state')
    @AuthPermissions(ResourceType.USERS, ActionType.UPDATE, [RoleName.ADMIN])
    async toggleState(@Param('id') id: string) {
        return await this.studentService.toggleState(id);
    }

    @Patch(':id/register-face')
    @AuthPermissions(ResourceType.STUDENTS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Registrar rostro de estudiante' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: RegisterFaceDto })
    @UseInterceptors(
        FileInterceptor('photo', {
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: imageFileFilter,
        }),
    )
    async registerFace(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.studentService.registerFace(id, file);
    }

    @Get(':id/face-status')
    @AuthPermissions(ResourceType.STUDENTS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Obtener estado facial del estudiante' })
    async getFaceStatus(@Param('id') id: string) {
        return await this.studentService.getFaceStatus(id);
    }

    @Delete(':id/face-profile')
    @AuthPermissions(ResourceType.STUDENTS, ActionType.DELETE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Eliminar perfil facial del estudiante' })
    async deleteFaceProfile(@Param('id') id: string) {
        return await this.studentService.deleteFaceProfile(id);
    }
}
