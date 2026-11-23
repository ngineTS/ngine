import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Navigation } from '../../domains/navigation/entities/navigation.entity';
import { NavigationValidatorService } from '../../domains/navigation/navigation-validator.service';
import { NavigationType } from '../../domains/navigation-type/entities/navigation-type.entity';
import { CustomTableRoleGuard } from './custom-table-role.guard';
import { RolesGuard } from './role.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Navigation, NavigationType])],
  providers: [
    NavigationValidatorService,
    RolesGuard
  ],
  exports: [
    NavigationValidatorService,
    RolesGuard
  ]
})
export class RoleGuardModule {}
