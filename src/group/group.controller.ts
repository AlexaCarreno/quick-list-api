import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import {
    ActionType,
    ResourceType,
} from '../rbac/permission/permission.interface';
import { RoleName } from '../rbac/roles/role.interface';
import { CreateGroupDto, GetGroupsQueryDto, UpdateGroupDto } from './group.dto';
import { CurrentUser } from '../rbac/decorators/current-user.decorator';

@ApiTags('Groups')
@Controller('groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    @AuthPermissions(ResourceType.GROUPS, ActionType.READ, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Listar todos los grupos' })
    async findAll(@Query() query: GetGroupsQueryDto) {
        return await this.groupService.findAll(query);
    }

    @Get('my-groups')
    @AuthPermissions(ResourceType.GROUPS, ActionType.READ, [RoleName.TEACHER])
    @ApiOperation({ summary: 'Obtener grupos asignados al teacher' })
    async getMyGroups(
        @CurrentUser('userId') userId: string,
        @Query() query: GetGroupsQueryDto,
    ) {
        return await this.groupService.findByTeacherId(userId, query);
    }

    @Get(':id')
    @AuthPermissions(ResourceType.GROUPS, ActionType.READ, [RoleName.ADMIN, RoleName.TEACHER])
    @ApiOperation({ summary: 'Obtener grupo por ID' })
    async findOne(@Param('id') id: string) {
        return await this.groupService.findById(id);
    }

    @Post()
    @AuthPermissions(ResourceType.GROUPS, ActionType.CREATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Crear nuevo grupo' })
    async create(
        @Body() body: CreateGroupDto,
        @CurrentUser('userId') userId: string,
    ) {
        return await this.groupService.create(body, userId);
    }

    @Patch(':id')
    @AuthPermissions(ResourceType.GROUPS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Actualizar grupo' })
    async update(@Param('id') id: string, @Body() body: UpdateGroupDto) {
        return await this.groupService.update(id, body);
    }

    @Patch(':id/toggle-status')
    @AuthPermissions(ResourceType.GROUPS, ActionType.UPDATE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Activar o desactivar grupo' })
    async toggleStatus(@Param('id') id: string) {
        return await this.groupService.toggleStatus(id);
    }

    @Delete(':id')
    @AuthPermissions(ResourceType.GROUPS, ActionType.DELETE, [RoleName.ADMIN])
    @ApiOperation({ summary: 'Eliminar grupo' })
    async delete(@Param('id') id: string) {
        return await this.groupService.delete(id);
    }
}
