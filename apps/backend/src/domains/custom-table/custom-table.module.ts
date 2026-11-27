import { Module } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { CustomTableController } from './custom-table.controller';
import { NavigationValidatorService } from '../navigation/navigation-validator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { Navigation } from '../navigation/entities/navigation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Navigation, NavigationType])],
  controllers: [CustomTableController],
  providers: [CustomTableService, NavigationValidatorService],
})
export class CustomTableModule {}
