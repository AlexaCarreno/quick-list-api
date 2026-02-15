import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';
import {
    CreateGroupDto,
    GroupIdDto,
    StatusDto,
    UpdateGroupDto,
} from './group.dto';
import { ServiceResponse } from './group.response-example';
import { GroupService } from './group.service';

import { GetUser } from '../jwt/jwt.decorators';
import { JwtPayload } from '../jwt/jwt.interface';

@Controller('group')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Post('/')
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'Crear un grupo' })
    @ApiOkResponse(ServiceResponse.createGroupSuccess)
    @ApiBadRequestResponse(ServiceResponse.groupBadRequest)
    public async createGroup(
        @Body() group: CreateGroupDto,
        @GetUser() user: JwtPayload,
    ) {
        const { userId } = user;
        return await this.groupService.createGroup(userId, group);
    }

    @Get('/:groupId')
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'Obtener un grupo por su identificador' })
    @ApiOkResponse(ServiceResponse.findOneGroupSuccess)
    @ApiBadRequestResponse(ServiceResponse.groupNotFound)
    public async findOneGroup(
        @Param('groupId') groupId: string,
        @GetUser() user: JwtPayload,
    ) {
        const { userId } = user;
        return await this.groupService.findOne(groupId, userId);
    }

    @Get('/')
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'Obtener todos los grupos de un usuario.' })
    @ApiOkResponse(ServiceResponse.getAllGroupsSuccess)
    public async findAll(@GetUser() user: JwtPayload) {
        const { userId } = user;
        return await this.groupService.findAll(userId);
    }

    @Put('/:groupId')
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'actualizar datos de un grupo' })
    @ApiOkResponse(ServiceResponse.updateGroupSuccess)
    public async updateGroup(
        @Param() { groupId }: GroupIdDto,
        @Body() group: UpdateGroupDto,
        @GetUser() user: JwtPayload,
    ) {
        const { userId } = user;
        return await this.groupService.updateGroup(userId, groupId, group);
    }

    @Patch('/:groupId/status')
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'activar o archivar un grupo.' })
    @ApiOkResponse(ServiceResponse.updateGroupSuccess)
    public async changeStatus(
        @Param() { groupId }: GroupIdDto,
        @Body() { status }: StatusDto,
        @GetUser() user: JwtPayload,
    ) {
        const { userId } = user;
        return await this.groupService.updateGroupStatus(
            userId,
            groupId,
            status,
        );
    }
}
