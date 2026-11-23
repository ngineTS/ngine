import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Feature, NavigationTypeNameArray, Action } from '../decorators/role.decorator';
import { DataSource } from 'typeorm';
import { NavigationValidatorService } from 'src/domains/navigation/navigation-validator.service';

/**
 * The idea, here, is to link a navigation to the action applied by the user.
 * The navigation can then be compared to user navigation permissions to allow or not the action.
 * 
 * This role requires the following parameters:
 * - The feature (ex: Calendar. It has to match entity name.)
 * - The action: view, edit or delete
 * - The navigation or navigation id (if possible)
 * - The navigation type name
 * 
 * Ways to identify navigation:
 * - navigation id is used as request parameter
 * - entity id is used as request parameter -> fetch navigation id from table
 * - navigation is used as request body
 * - no parameter, no body or no navigation found -> Valid action based on navigation type
 */
@Injectable()
export class RolesGuard implements CanActivate {
  
  constructor(
    private _reflector: Reflector,
    private _datasource: DataSource,
    private _navigationValidatorService: NavigationValidatorService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this._reflector.get(Action, context.getHandler());
    if (!action) {
      return true;
    }
    
    const entity = this._reflector.get(Feature, context.getClass());
    const navigationTypeNameArray = this._reflector.get(NavigationTypeNameArray, context.getClass());
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const user = request.user;

    switch (action) {

      case 'view':
        const navigationGroupId = params.navigationGroupId ?? params.navigationId;
        /* if we look for a specific navigation group id */
        if (navigationGroupId) {
          return this._navigationValidatorService.validUserPermissionByNavigationGroupId(
            user.userNavigationPermissions,
            navigationGroupId,
            'view'
          );
        }
        /* if we look for a specific id then find navigation group id associated */
        if (params.id && entity) {
          const data = await this.findNavigationInTableById(entity, params.id);
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data.navigationId) {
            return this._navigationValidatorService.validUserPermissionByNavigationGroupId(
              user.userNavigationPermissions,
              data.navigationId,
              'view'
            );
          }
        }
        /* if table not aggregated by navigationId then check for navigation type only */
        this._navigationValidatorService.validUserPermissionByNavigationType(
          navigationTypeNameArray,
          user.userNavigationPermissions,
          'view'
        );

      case 'edit':
        /* if we look for a specific id then find navigation id associated. */
        if (params.id && entity) {
          const data = await this.findNavigationInTableById(entity, params.id);   
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data.navigationId) {
            return this._navigationValidatorService.validUserPermissionByNavigationGroupId(
              user.userNavigationPermissions,
              data.navigationId,
              'edit'
            );
          }
        }
        /* if table not aggregated by navigationId then check for navigationType only */
        this._navigationValidatorService.validUserPermissionByNavigationType(
          navigationTypeNameArray,
          user.userNavigationPermissions,
          'edit'
        );

      case 'add':
        /* if we pass a body then look for navigation id inside body props. */
        if (body?.navigationId) {
          return this._navigationValidatorService.validUserPermissionByNavigationGroupId(
            user.userNavigationPermissions,
            body.navigationId,
            'edit'
          );
        }
        /* if table not aggregated by navigationId then check for navigationType only */
        this._navigationValidatorService.validUserPermissionByNavigationType(
          navigationTypeNameArray,
          user.userNavigationPermissions,
          'edit'
        );

      case 'delete':
        /* if we look for a specific id then find navigation id associated. */
        if (params.id && entity) {
          const data = await this.findNavigationInTableById(entity, params.id);
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data.navigationId) {
            return this._navigationValidatorService.validUserPermissionByNavigationGroupId(
              user.userNavigationPermissions,
              data.navigationId,
              'delete'
            );
          }
        }
        /* if we pass a body then look for navigation id inside body props. */
        if (body?.navigationId) {
          return this._navigationValidatorService.validUserPermissionByNavigationGroupId(
            user.userNavigationPermissions,
            body.navigationId,
            'delete'
          );
        }
        /* if table not aggregated by navigationId then check for navigationType only */
        this._navigationValidatorService.validUserPermissionByNavigationType(
          navigationTypeNameArray,
          user.userNavigationPermissions,
          'delete'
        );
    }

    return false;
  }

  /**
   * Find record in repository for given entity and id.
   * 
   * @param entityClassName The TypeORM entity class name.
   * @param id The id.
   * @returns The record.
   */
  async findNavigationInTableById(entityClassName: string, id: string) {
    const repo = this._datasource.getRepository(entityClassName);
    return repo.findOneBy({ id });
  }
}