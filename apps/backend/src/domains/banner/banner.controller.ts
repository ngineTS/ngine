import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Action, Feature, NavigationTypeNameArray } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@Feature('Banner')
@NavigationTypeNameArray(['banner-management'])
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @Action('add')
  @UseGuards(RolesGuard)
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannerService.create(createBannerDto);
  }

  @Get()
  @Action('view')
  @UseGuards(RolesGuard)
  findAll() {
    return this.bannerService.findAll();
  }

  @Get('navigation/:navigationGroupId')
  findOneByNavigationId(@Param('navigationGroupId') navigationGroupId: string) {
    return this.bannerService.findOneByNavigationId(navigationGroupId);
  }

  @Patch(':id')
  @Action('edit')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannerService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @Action('delete')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
}
