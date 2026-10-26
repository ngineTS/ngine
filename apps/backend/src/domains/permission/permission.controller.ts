import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { NavigationTypeNameArray, Action } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@NavigationTypeNameArray(['role-management'])
@Controller('permission')
export class PermissionController {

  constructor(private readonly _permissionService: PermissionService) {}

  @Action('view')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this._permissionService.findAll();
  }

}
