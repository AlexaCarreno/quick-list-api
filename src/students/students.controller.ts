import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import {
    CreateStudentDto,
    GetStudentsQueryDto,
    UpdateStudentDto,
} from './students.dto';
import { StudentService } from './students.service';
import { imageFileFilter } from '../common/utils/file-filter';

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
}
