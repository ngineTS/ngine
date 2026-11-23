import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { TableVizService } from './table-viz.service';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { Feature, NavigationTypeNameArray, Action } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';

@Feature('TableViz')
@NavigationTypeNameArray(['content-visualization', 'content-management'])
@Controller('table-viz')
export class TableVizController {

  constructor(private readonly _tableVizService: TableVizService) {}

  @Action('add')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createTableVizDto: CreateTableVizDto) {
    return this._tableVizService.create(createTableVizDto);
  }

  @Action('view')
  @UseGuards(RolesGuard)
  @Get('navigation/:navigationId')
  findByNavigationId(@Param('navigationId') navigationId: string) {
    return this._tableVizService.findByNavigationId(navigationId);
  }

  @Get('table-names') 
  findTableNames() {
    return this._tableVizService.findTableNames();
  }

  @Action('edit')
  @UseGuards(RolesGuard)
  @Get('table-content/:tableName/:navigationGroupId')
  async findTableContentByTableName(
    @Param('tableName') tableName: string,
  ) {
    return this._tableVizService.findTableContentByTableName(tableName);
  }

  @Action('edit')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableVizDto: UpdateTableVizDto) {
    return this._tableVizService.update(id, updateTableVizDto);
  }

}
