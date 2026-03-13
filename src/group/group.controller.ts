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
import { ApiTags } from '@nestjs/swagger';
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
    async findAll(@Query() query: GetGroupsQueryDto) {
        return await this.groupService.findAll(query);
    }

    @Get(':id')
    @AuthPermissions(ResourceType.GROUPS, ActionType.READ, [RoleName.ADMIN])
    async findOne(@Param('id') id: string) {
        return await this.groupService.findById(id);
    }

    @Post()
    @AuthPermissions(ResourceType.GROUPS, ActionType.CREATE, [RoleName.ADMIN])
    async create(
        @Body() body: CreateGroupDto,
        @CurrentUser('userId') userId: string,
    ) {
        return await this.groupService.create(body, userId);
    }

    @Patch(':id')
    @AuthPermissions(ResourceType.GROUPS, ActionType.UPDATE, [RoleName.ADMIN])
    async update(@Param('id') id: string, @Body() body: UpdateGroupDto) {
        return await this.groupService.update(id, body);
    }

    @Patch(':id/toggle-status')
    @AuthPermissions(ResourceType.GROUPS, ActionType.UPDATE, [RoleName.ADMIN])
    async toggleStatus(@Param('id') id: string) {
        return await this.groupService.toggleStatus(id);
    }

    @Delete(':id')
    @AuthPermissions(ResourceType.GROUPS, ActionType.DELETE, [RoleName.ADMIN])
    async delete(@Param('id') id: string) {
        return await this.groupService.delete(id);
    }
}
