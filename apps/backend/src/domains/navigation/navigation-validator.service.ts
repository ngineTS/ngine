import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateNavigationDto } from "./dto/update-navigation.dto";
import { In, IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Navigation } from "./entities/navigation.entity";
import { NavigationType } from "../navigation-type/entities/navigation-type.entity";
import { CreateNavigationDto } from "./dto/create-navigation.dto";
import { RoleNavigationPermission } from "../role-navigation-permission/entities/role-navigation-permission.entity";

@Injectable()
export class NavigationValidatorService {

  constructor(
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>,
    @InjectRepository(NavigationType)
    private _navigationTypeRepository: Repository<NavigationType>,
  ) {}

  /**
   * Valid permission to add navigation.
   * 
   * @param createNavigationDto The navigation.
   * @param userNavigationPermissions The user navigation permission from request.
   * @throws {ForbiddenException} If user doesn't have 'edit' permission on parent.
   */
  async validAddPermission(
    createNavigationDto: CreateNavigationDto,
    userNavigationPermissions: Array<RoleNavigationPermission>
  ) {
    const hasUserPermission = await this.validUserPermissionByNavigationGroupId(
      userNavigationPermissions,
      createNavigationDto.parentGroupId,
      'edit'
    );
  
    if (!hasUserPermission) {
      throw new ForbiddenException();
    }
  }

  /**
   * Valid permission to edit navigation.
   * 
   * @param id The navigation id.
   * @param userNavigationPermissions The user navigation permissions from the request.
   * @param updateNavigationDto The navigation properties to update.
   * @throws {ForbiddenException} If user doesn't have 'edit' permission on navigation.
   * @throws {ForbiddenException} If parentGroupId is in the request and user doesn't have 'edit' permisson on it.
   * @throws {NotFoundException} If navigation id is not found in database.
   */
  async validEditPermission(
    id: string,
    updateNavigationDto: UpdateNavigationDto,
    userNavigationPermissions: Array<RoleNavigationPermission>
  ) {
    const dbNavigation = await this._navigationRepository.findOne({
      where: { id: id }
    });
    if (!dbNavigation) {
      throw new NotFoundException(`Navigation with id ${id} doesn't exist.`);
    }

    if (!dbNavigation.isDraft) {
      throw new ForbiddenException(`'Publish' record cannot be edited.`);
    }

    if (
      !userNavigationPermissions.find(
        obj => obj.navigationGroupId === dbNavigation.groupId 
        && obj.permission.name.includes('edit')
      ) &&
      !userNavigationPermissions.find(
        obj => dbNavigation.ancestorGroupIds.includes(obj.navigationGroupId)
        && obj.permission.name.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }

    if ('parentGroupId' in updateNavigationDto && updateNavigationDto.parentGroupId !== dbNavigation.parentGroupId) {
      const hasUserPermission = await this.validUserPermissionByNavigationGroupId(
        userNavigationPermissions,
        updateNavigationDto.parentGroupId!,
        'edit'
      );

      if (!hasUserPermission) {
        throw new ForbiddenException();
      }
    }

    return dbNavigation;
  }


  /**
   * Valid permission to delete navigation.
   * 
   * @param navigation The navigation to delete.
   * @param userNavigationPermissions The user navigation permissions from the request.
   * @throws {ForbiddenException} If user doesn't have delete permission on navigation 
   * @throws {BadRequestException} If navigation is global navigation.
   */
  async validDeletePermission(
    navigation: Navigation,
    userNavigationPermissions: Array<RoleNavigationPermission>
  ) {
    if (navigation.name === 'global') {
      throw new BadRequestException('Global navigation cannot be deleted.');
    }

    const hasUserPermission = await this.validUserPermissionByNavigationGroupId(
      userNavigationPermissions,
      navigation.groupId,
      'delete'
    );

    if (!hasUserPermission) {
      throw new ForbiddenException();
    }
  }

  /**
   * Valid navigation business rules.
   * 
   * @param navigationDto The navigation to insert or update.
   * @param dbNavigation The navigation from database (optional).
   * @throws {NotFoundException} If `navigationDto.parentGroupId` is not found in the database.
   * @throws {NotFoundException} If `navigationDto.navigationTypeId` is not found in the database.
   * @throws {BadRequestException} If `navigationDto` type is a button and parent is not a menu or a redirect-button.
   * @throws {BadRequestException} If `navigationDto` type is a component and parent is not a dialog-button or a redirect-button without nav bar.
   * @throws {BadRequestException} If `navigationDto.name` is already used by sister navigations.
   * @throws {BadRequestException} If `navigationDto.parentGroupId` is equal to `navigationGroupId`.
   * @throws {BadRequestException} If `navigationDto` parent is found in the descendants of navigation to update.
   * @throws {BadRequestException} If `navigationDto.showIconOnly` is true and `navigationDto.icon` is empty.
   */
  async validNavigationDto(
    navigationDto: UpdateNavigationDto,
    dbNavigation?: Navigation
  ) {
    let parentNavigation: Navigation | null = null;
    if (navigationDto.parentGroupId) {
      parentNavigation = await this._navigationRepository.findOne({
        where: {
          groupId: navigationDto.parentGroupId,
          deletedDate: IsNull(),
        },
        relations: [
          'navigationType',
          'menu',
          'children'
        ]
      });
    
      if (!parentNavigation) {
        throw new NotFoundException(`Parent with group id ${navigationDto.parentGroupId} doesn't exist.`)
      }
      parentNavigation.children = parentNavigation.children.filter(child => !child.deletedDate);

      const navigationType = await this._navigationTypeRepository.findOne({
        where: { id: navigationDto.navigationTypeId }
      });
      if (!navigationType) {
        throw new NotFoundException(`Navigation type ${navigationDto.navigationTypeId} doesn't exist.`)
      }

      /* if it is a custom button */
      if (
        navigationType.name === 'redirect-button' ||
        navigationType.name === 'menu-button' ||
        navigationType.name === 'dialog-button' ||
        navigationType.name === 'external-link-button'
      ) {
        if (
          parentNavigation.navigationType.name !== 'redirect-button' &&
          parentNavigation.navigationType.name !== 'menu-button'
        ) {
          throw new BadRequestException(
            `${navigationType.displayLabel} cannot be a added inside ${parentNavigation.navigationType.displayLabel}.`
          );
        }
      }
      /* if it is a component */
      else {
        if (
          parentNavigation.navigationType.name !== 'redirect-button' &&
          parentNavigation.navigationType.name !== 'dialog-button'
        ) {
          throw new BadRequestException(
            `${navigationType.displayLabel} cannot be added inside ${parentNavigation.navigationType.displayLabel}.`
          );
        }
        if (parentNavigation.menu) {
          throw new BadRequestException(
            `${navigationType.displayLabel} cannot be added inside a menu.`
          );
        }
      }
      
      if (navigationDto.displayLabel) {
        navigationDto['name'] = navigationDto.displayLabel?.toLowerCase()?.replace(/[ \/]/g, "-");
        navigationDto['name'] = navigationDto.displayLabel?.toLowerCase()?.replace(/[ \/&]/g, "-");
        const sisterNavigations = parentNavigation.children.filter(child => child.groupId !== dbNavigation?.groupId);
        if (sisterNavigations?.find(navigation => navigation.name ===  navigationDto['name'])) {
          throw new BadRequestException('A sister navigation has already this name.');
        }
      }

      if (dbNavigation) {
        if (dbNavigation.groupId === navigationDto.parentGroupId) {
          throw new BadRequestException('Parent cannot be same navigation');
        }

        await this.checkIfIsADescendant(dbNavigation.groupId, navigationDto.parentGroupId);
      }

      if (navigationDto.showIconOnly && !navigationDto.icon) {
        throw new BadRequestException(`"Show icon only" can't be true if there is no icon.`);
      }
      
      //TODO: Valid and external link input based on on nav type
    }

    return parentNavigation;
  }

  /**
   * Check if given navigation is in descendants of other navigation.
   * 
   * @param navigationGroupId The navigation with descendants.
   * @param parentGroupId The navigation to check.
   */
  async checkIfIsADescendant(navigationGroupId: string, parentGroupId: string) {

    const rows = await this._navigationRepository.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT "groupId"
        FROM ${process.env.DB_SCHEMA}.navigation
        WHERE "parentGroupId" = $1
        UNION ALL
        SELECT n."groupId"
        FROM ${process.env.DB_SCHEMA}.navigation n
        JOIN descendants d ON n."parentGroupId" = d."groupId"
      )
      SELECT 1
      FROM descendants
      WHERE "groupId" = $2
      LIMIT 1
      `,
      [navigationGroupId, parentGroupId],
    );

    if (rows.length) {
      throw new BadRequestException('Parent cannot be a descendant');
    }
  }

  /**
   * Valid permission to publish navigation.
   * 
   * User must have 'edit' permission on the navigation to publish it.
   * 
   * @param navigationGroupId The navigation group id to publish.
   * @param userNavigationPermissions The user's navigation permissions.
   */
  async validPublishPermission(
    navigationGroupId: string,
    userNavigationPermissions: Array<RoleNavigationPermission>
  ) {
    const hasUserPermission = await this.validUserPermissionByNavigationGroupId(
      userNavigationPermissions,
      navigationGroupId,
      'edit'
    );

    if (!hasUserPermission) {
      throw new ForbiddenException();
    }
  }

  /**
   * Valid user permission for specific action by navigation group Id.
   * 
   * 1. Check if user has permission on the navigation.
   * 2. If not, check if user has permission on the ancestor of the navigation.
   * 
   * @param userNavigationPermissions The user navigation permissions.
   * @param navigationGroupId The navigation group id to check.
   * @param action The action.
   * @returns True if user has permission, false if not.
   */
  async validUserPermissionByNavigationGroupId(
    userNavigationPermissions: Array<RoleNavigationPermission>,
    navigationGroupId: string,
    action: string
  ) {
    /* 1. */
    if (
      userNavigationPermissions.find(
        obj => obj.navigationGroupId === navigationGroupId
        && obj.permission.name.includes(action)
      )
    ) {
      return true;
    }

    /* 2. */
    const navigation = await this._navigationRepository.findOne({
      where: {
        deletedDate: IsNull(),
        groupId: navigationGroupId,
      }
    });

    if (!navigation) {
      throw new NotFoundException(`Navigation with group id ${navigationGroupId} not found.`)
    }

    if (
      userNavigationPermissions.find(
        obj => navigation.ancestorGroupIds?.includes(obj.navigationGroupId)
        && obj.permission.name.includes(action)
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Valid if user has permission on a navigation associated to given navigation type.
   * 
   * If user navigation permissions already include this navigation type return true
   * otherwise find in database all navigations for this type and compare their ancestor with user role navigation permissions.
   * 
   * @param navigationTypeName The navigation type name to validate.
   * @param userNavigationPermissions The user navigation permissions.
   * @param action The action.
   * @returns True or false.
   */
  async validUserPermissionByNavigationType(
    navigationTypeNames: Array<string>,
    userNavigationPermissions: Array<RoleNavigationPermission>,
    action: string
  ) {
    if (
      userNavigationPermissions.find(obj => 
        navigationTypeNames.includes(obj.navigation.navigationType.name)
        && obj.permission.name.includes(action)
      )
    ) {
      return true;
    }

    const navigations = await this._navigationRepository.find({
      relations: ['navigationType'],
      where: {
        deletedDate: IsNull(),
        navigationType: {
          name: In(navigationTypeNames)
        }
      }
    });

    for (const navigation of navigations) {
      for (const ancestorGroupId of navigation.ancestorGroupIds) {
        if (
          userNavigationPermissions.find(obj => 
            obj.navigationGroupId === ancestorGroupId
            && obj.permission.name.includes(action)
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

}