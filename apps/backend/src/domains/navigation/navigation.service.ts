import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { ArrayContains, ArrayOverlap, In, IsNull, Repository } from 'typeorm';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { MenuService } from '../menu/menu.service';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { ContainerStyleService } from '../container-style/container-style.service';
import { TypographyStyleService } from '../typography-style/typography-style.service';
import { ContainerLayoutService } from '../container-layout/container-layout.service';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from '../permission/entities/permission.entity';

@Injectable()
export class NavigationService {

  constructor(
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>,
    @InjectRepository(NavigationType)
    private _navigationTypeRepository: Repository<NavigationType>,
    @InjectRepository(RoleNavigationPermission)
    private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>,
    @Inject(forwardRef(() => MenuService))
    private _menuService: MenuService,
    @Inject(forwardRef(() => ContainerLayoutService))
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
  ) {}

  /**
   * Find all flat navigations with their navigationType, filtered by user permission.
   * 
   * @param userNavigationPermissions The user navigation permissions from request.
   * @returns The array of navigations.
   */
  async findAllNavigations(userNavigationPermissions: Array<RoleNavigationPermission>) {
    const userNavigationGroupIds = userNavigationPermissions.map<string>(
      roleNavigationPermission => roleNavigationPermission.navigationGroupId
    );

    return await this._navigationRepository.find({
      where: [
        {
          groupId: In(userNavigationGroupIds),
          isDraft: true,
          deletedDate: IsNull()
        },
        {
          ancestorGroupIds: ArrayOverlap(userNavigationGroupIds),
          isDraft: true,
          deletedDate: IsNull()
        }
      ],
      relations: ['navigationType', 'parent'],
      order: { displayLabel: 'ASC' }
    });
  }

  /**
   * Load nested navigations with permissions.
   * 
   * @param userRoleNavigationPermissions The user role navigation permissions from request token.
   * @returns Nested navigation tree with permissions setup on each node.
   * @throws {BadRequestException} if user has no permission on any navigation.
   */
  async loadNestedNavigations(
    userRoleNavigationPermissions: Array<RoleNavigationPermission>
  ) {
    const { root, rootPermission } = await this.loadRootNavigation(userRoleNavigationPermissions);
    root.children = await this.loadNavigationChildren(root, rootPermission, userRoleNavigationPermissions);
    
    return root;
  }

  /**
   * Load root navigation with all required relations.
   * 
   * If user has edit permission on root then load 'draft' root record else load 'publish' root record.
   * 
   * @returns The root navigation and its permission.
   * @throws {BadRequestException} If root navigation is not found.
   */
  private async loadRootNavigation(
    userRoleNavigationPermissions: Array<RoleNavigationPermission>
  ): Promise<{
    root: Navigation,
    rootPermission: Permission | undefined
  }> {
    const rootGroupId = '00000000-0000-0000-0000-000000000000';
    const rootPublishRecordId = '00000000-0000-0000-0000-000000000000';
    const rootDraftRecordId = '11111111-1111-1111-1111-111111111111';

    const rootPermission = userRoleNavigationPermissions.find(
      obj => obj.navigationGroupId === rootGroupId
    )?.permission;

    const rootId = rootPermission?.name.includes('edit') ? rootDraftRecordId : rootPublishRecordId;
    
    const root = await this._navigationRepository.findOne({
      where: { id: rootId },
      relations: [
        'navigationType',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle',
        'menu.typographyStyle'
      ]
    });

    if (!root) {
      throw new BadRequestException('Global navigation is missing.');
    }

    if (rootPermission) {
      root['permissionName'] = rootPermission.name;
    }
    
    return { root, rootPermission };
  }

  /**
   * Load navigation levels
   * 
   * @param navigation The parent navigation.
   * @param navigationPermission The parent navigation permission.
   * @param userRoleNavigationPermissions The user role navigations permissions from request token.
   * @returns 
   */
  async loadNavigationChildren(
    navigation: Navigation,
    navigationPermission: Permission | undefined,
    userRoleNavigationPermissions: Array<RoleNavigationPermission>,
  ) {
    let children = await this._navigationRepository.find({
      where: {
        deletedDate: IsNull(),
        parentGroupId: navigation.groupId
      },
      relations: [
        'navigationType',
        'containerLayout',
        'containerStyle',
        'typographyStyle',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle',
        'menu.typographyStyle'
      ]
    });

    for (const child of children) {
      let hasUserPermissionOnNavigationOrDescendant = true;

      let childPermission = userRoleNavigationPermissions.find(rnp => 
        rnp.navigationGroupId === child.groupId
      )?.permission;

      if (childPermission && navigationPermission) {
        // Case 1: child permission higher than parent one -> keep child permission
        if (childPermission.priority < navigationPermission.priority) {
          child['permissionName'] = childPermission.name;
        }
        // Case 2: parent permission higher than child one -> inherit parent permission
        else {
          child['permissionName'] = navigationPermission.name;
          childPermission = navigationPermission;
        }
      }
      // Case 3: child permission not found but parent yes -> inherit parent permission
      else if (navigationPermission) {
        child['permissionName'] = navigationPermission.name;
        childPermission = navigationPermission;
      }
      // Case 4: parent permission not found but child yes -> keep child permission
      else if (childPermission) {
        child['permissionName'] = childPermission.name;
      }
      // Case 5: child and parent permissions not found -> check if user has access to one of the descendants
      else {
        hasUserPermissionOnNavigationOrDescendant = await this.hasUserPermissionOnDescendant(child, userRoleNavigationPermissions);
      }

      if (hasUserPermissionOnNavigationOrDescendant) {
        //if user has edit permission load children of draft record else load children of published record
        //we do this to not duplicate the load of children
        if (child['permissionName']?.includes('edit') && child.isDraft) {
          child.children = await this.loadNavigationChildren(child, childPermission, userRoleNavigationPermissions);
        }
        if ((!child['permissionName'] || !child['permissionName'].includes('edit')) && !child.isDraft) {
          child.children = await this.loadNavigationChildren(child, childPermission, userRoleNavigationPermissions);
        }
      }
    }
    
    /* 
      Business rules:
      - keep navigation if user has permission on it or if this navigation has children
      - keep draft record if user has edit permission else keep published record
      - keep disabled navigation if user has edit permission
    */
    children = children.filter(child => {
      const permission = child['permissionName'];
      const hasEditPermission = permission?.includes('edit') ?? false;
      return (
        ((hasEditPermission && child.isDraft) || (!hasEditPermission && !child.isDraft)) &&
        (!child.isDisabled || hasEditPermission) && (permission || child.children)
      );
    });

    return children;
  }

  /**
   * Check if user has access to one of the descendants of a given navigation.
   * 
   * @param navigation The navigation to check the descendants
   * @param userNavigationPermissions The array of user navigation permissions.
   * @returns A promise of true or false.
   */
  async hasUserPermissionOnDescendant(
    navigation: Navigation,
    userNavigationPermissions: Array<RoleNavigationPermission>
  ): Promise<boolean> {
    const descendants = await this._navigationRepository.find({
      where: {
        deletedDate: IsNull(),
        ancestorGroupIds: ArrayContains([navigation.groupId])
      }
    });

    for (const descendant of descendants) {
      if (userNavigationPermissions.find(rnp => rnp.navigationGroupId === descendant.groupId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Save navigation with default style.
   * 
   * 1. Add draft and audit data, generate ancestor group ids and save navigation.
   * 2. Assign style properties.
   * 3. If navigation is a menu button then create menu and assign style properties.
   * 4. Assign permission and return navigation saved.
   * 
   * @param createNavigationDto The navigation to save.
   * @param parentNavigation The parent navigation.
   * @param userId The user id from request.
   * @param yPos The y position for the new navigation (optional).
   * @returns The navigation saved.
   */
  async saveNavigation(
    createNavigationDto: CreateNavigationDto,
    parentNavigation: Navigation,
    yPos: number | undefined,
    userId: string
  ): Promise<Navigation> {
    /* 1 */
    createNavigationDto['isDraft'] = true;
    createNavigationDto['groupId'] = uuidv4();
    createNavigationDto['unpublishedChanges'] = ['all'];
    createNavigationDto['createdBy'] = userId;
    createNavigationDto['createdDate'] = new Date();
    createNavigationDto['updatedBy'] = userId;
    createNavigationDto['updatedDate'] = new Date();

    const navigationType = await this._navigationTypeRepository.findOne({
      where: { id: createNavigationDto.navigationTypeId }
    });
    if (!navigationType) {
      throw new NotFoundException(`Navigation type with id ${createNavigationDto.navigationTypeId} not found.`);
    }

    if (navigationType.name === 'menu-button') {
      createNavigationDto['unpublishedChanges'].push('menu');
    }

    const ancestorGroupIds = await this.generateAncestorGroupIds(parentNavigation.groupId);
    createNavigationDto['ancestorGroupIds'] = ancestorGroupIds;

    const navigationSaved = await this._navigationRepository.save(createNavigationDto);

    /* 2. */
    const isInsideMenu = parentNavigation.menu ? true : false;
    navigationSaved.containerLayout = await this._containerLayoutService.createObjectContainerLayout({
      refId: navigationSaved.id,
      yPos: yPos ?? null,
      xPos: 0
    });
    navigationSaved.containerStyle = await this._containerStyleService.createObjectDefaultContainerStyle(navigationSaved.id, isInsideMenu);
    navigationSaved.typographyStyle = await this._typographyStyleService.createObjectDefaultTypographyStyle(navigationSaved.id);
    navigationSaved.navigationType = navigationType;

    /* 3. */
    if (navigationType.name === 'menu-button') {
      const menuSaved = await this._menuService.createMenu(navigationSaved.id);
      menuSaved.containerLayout = await this._containerLayoutService.createObjectContainerLayout({ refId: menuSaved.id });
      menuSaved.containerStyle = await this._containerStyleService.createObjectDefaultContainerStyle(menuSaved.id);
      menuSaved.typographyStyle = await this._typographyStyleService.createObjectDefaultTypographyStyle(menuSaved.id);
      navigationSaved.menu = menuSaved;
    }

    /* 4. */
    navigationSaved['permissionName'] = 'Can view, edit and delete';

    return navigationSaved;
  }

  /**
   * Update navigation.
   * 
   * 1. Get existing navigation from db.
   * 2. Push properties to 'unpublishedChanges' keeping uniqueness
   * 3. If parent has changed and old parent has no more children then delete his menu.
   * 4. If parent has changed then update ancestorGroupIds for navigation and all descendants.
   * 5. Add audit data and update navigation.
   * 
   * @param id The navigation id.
   * @param updateNavigationDto The navigation properties to update.
   * @param userId The user id from request.
   * @returns An UpdateResponse type object.
   * @throws {NotFoundException} If navigation id is not found in database.
   */
  async updateNavigation(
    id: string,
    updateNavigationDto: UpdateNavigationDto,
    userId: string,
  ) {
    /* 1 */
    const dbNavigation = await this._navigationRepository.findOne({
      where: { id: id }
    });
    if (!dbNavigation) {
      throw new NotFoundException();
    }

    /* 2 */ 
    const setOfKeys = new Set(dbNavigation.unpublishedChanges);
    setOfKeys.add('navigation');
    updateNavigationDto['unpublishedChanges'] = [...setOfKeys];
    
    if ('parentGroupId' in updateNavigationDto && updateNavigationDto.parentGroupId !== dbNavigation.parentGroupId) {
      updateNavigationDto['unpublishedChanges'].push('parent');
      
      /* 3. */
      const oldParentNavigation = await this._navigationRepository.findOne({
        relations: ['children', 'menu'],
        where: { 
          id: dbNavigation.parentGroupId,
          deletedDate: IsNull(),
        },
      });

      if (oldParentNavigation?.menu && oldParentNavigation?.children?.filter(obj => !obj.deletedDate).length === 1) {
        await this._menuService.remove(oldParentNavigation.menu.id);
        await this._containerLayoutService.deleteByRefId(oldParentNavigation.menu.id);
        await this._containerStyleService.deleteByRefId(oldParentNavigation.menu.id);
        await this._typographyStyleService.deleteByRefId(oldParentNavigation.menu.id);
      }

      /* 4. */
      const ancestorGroupIds = await this.generateAncestorGroupIds(updateNavigationDto.parentGroupId!);
      updateNavigationDto['ancestorGroupIds'] = ancestorGroupIds;
      await this.updateDescendantAncestorGroupIds(dbNavigation, ancestorGroupIds);
    }

    /* 5. */
    updateNavigationDto["updatedBy"] = userId;
    updateNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.update(id, updateNavigationDto);
  }

  /**
   * Update Array of navigations.
   * 
   * @param navigations The array of navigations.
   * @param userId The user id from request.
   * @returns The array of navigations saved.
   */
  async updateNavigations(
    navigations: Array<{
      groupId: string;
      order: number;
    }>,
    userId: string,
  ): Promise<{ message: string }> {
    await Promise.all(
      navigations.map(async (navigation) => {
        const navigationToUpdate = {
          ...navigation,
          updatedBy: userId,
          updatedDate: new Date(),
        };

        await this._navigationRepository.update(
          { groupId: navigation.groupId },
          navigationToUpdate,
        );
      }),
    );

    return { message: 'Navigations updated successfully.' };
  }

  /**
   * Delete navigation, his descendants and related dependencies.
   * 
   * 1. Retrieve recursively children and related menu to delete.
   * 2. Soft delete navigation, his descendants and delete related style properties.
   * 3. Check if parent navigation has a menu and remains without children. If yes retrieve menu to delete.
   * 4. Delete menus retrieved on step 2 & 4 and delete style properties.
   * 5. Delete roleNavigationPermissions associated to navigations deleted.
   * 6. Return number of navigation soft deleted.
   * 
   * @param navigation The navigation to delete.
   * @param userId The user id from request.
   * @returns The Array of navigations that have been soft deleted.
   */
  async removeNavigation(navigation: Navigation, userId: string) {
    /* 1. Retrieve recursively children and related menu to delete.*/
    const navigationGroupIds: Array<string> = [];
    const navigationRecordsToDelete: Array<Pick<Navigation, 'id' | 'deletedBy' | 'deletedDate'>> = [];
    const menuIdsToDelete: Array<string> = [];

    /* declare method to retrieve navigations and menus to delete */
    const getDeepNavigationIds = async (navigation: Navigation) => {

      // get 'draft' and 'publish' record for given navigation group id and store group id.
      const draftAndPublishNavigations = await this._navigationRepository.find({
        take: 2,
        relations: ['menu', 'children'],
        where: { groupId: navigation.groupId }
      });
      navigationGroupIds.push(navigation.groupId);

      // store nav and menu records to delete for 'draft' and 'publish' record
      for (const nav of draftAndPublishNavigations) {
        navigationRecordsToDelete.push({
          id: nav.id,
          deletedBy: userId,
          deletedDate: new Date()
        });

        if (nav.menu) {
          menuIdsToDelete.push(nav.menu.id);
        }

        //apply process for children
        if (nav.children) {
          for (const child of nav.children) {
              await getDeepNavigationIds(child);
          }
        }
      };
    } 
    /* call method */
    await getDeepNavigationIds(navigation);

    /* 2. Soft delete navigations, descendants and delete related style properties. */
    const navigationsSoftDeleted = await this._navigationRepository.save(navigationRecordsToDelete);
    for (const navigation of navigationRecordsToDelete) {
      await this._containerLayoutService.deleteByRefId(navigation.id);
      await this._containerStyleService.deleteByRefId(navigation.id);
      await this._typographyStyleService.deleteByRefId(navigation.id);
    }
    
    /* 3. Check if parent navigation has a menu and remains without children. If yes retrieve menu to delete. */
    const parentNavigationDraftAndPublishRecords = await this._navigationRepository.find({
      take: 2,
      where: { 
        groupId: navigation.parentGroupId,
        deletedDate: IsNull(),
      },
      relations: ['children', 'menu', 'navigationType']
    });

    if (
      parentNavigationDraftAndPublishRecords
      && parentNavigationDraftAndPublishRecords[0].navigationType.name !== 'menu-button'
      && parentNavigationDraftAndPublishRecords[0].children.filter(obj => !obj.deletedDate).length === 0
    ) {
      for (const parentNavigation of parentNavigationDraftAndPublishRecords) {
        if (parentNavigation.menu) {
          menuIdsToDelete.push(parentNavigation.menu.id);
        }
      }
    }

    /* 4. Delete menus retrieved on step 2 & 4 and delete style properties. */
    for (const id of menuIdsToDelete) {
      await this._menuService.remove(id);
      await this._containerLayoutService.deleteByRefId(id);
      await this._containerStyleService.deleteByRefId(id);
      await this._typographyStyleService.deleteByRefId(id);
    }

    /* 5. Delete roleNavigationPermissions associated to navigations deleted. */
    const roleNavigationsPermissions = await this._roleNavigationPermissionRepository.find({
      where: { navigationGroupId: In(navigationGroupIds) }
    })
    for (let roleNavigationsPermission of roleNavigationsPermissions) {
      roleNavigationsPermission.deletedBy = userId;
      roleNavigationsPermission.deletedDate = new Date();
    }
    await this._roleNavigationPermissionRepository.save(roleNavigationsPermissions);
    
    /* 6. Return number of navigation soft deleted. */
    return { affected: navigationsSoftDeleted.length }
  }


  /**
   * Publish navigation.
   * 
   * CASE 1 - Only draft navigation exists:
   * - copy draft record and save it as published record
   * - copy style and menu relations of draft record and create relations of published record
   * - update draft record to mention no changes is pending to be published
   * 
   * CASE 2 - Draft and publish navigations exist:
   * - copy draft record properties into published record
   * - copy unpublishedChanges relations into relations of published record
   * - update draft record to mention no changes is pending to be published
   * 
   * If navigation has a menu, then we publish automatically his menu and relations.
   * 
   * @param navigationGroupId The navigation group id.
   * @param userId The user id of the request.
   * @throws {NotFoundException} If no navigation found for this group id.
   */
  async publishNavigation(
    navigationGroupId: string,
    userId: string
  ): Promise<{ message: string; }> {
    const navigations = await this.getNavigationsByGroupId(navigationGroupId);

    /* CASE 1 */
    if (navigations.length === 1) {
      let { id: _, containerLayout, containerStyle, typographyStyle, menu, ...navigationPublishedRecord } = navigations[0];
      navigationPublishedRecord.isDraft = false;
      navigationPublishedRecord.unpublishedChanges = [];
      navigationPublishedRecord.createdBy = userId;
      navigationPublishedRecord.createdDate = new Date();
      navigationPublishedRecord.updatedBy = navigationPublishedRecord.createdBy;
      navigationPublishedRecord.updatedDate = navigationPublishedRecord.createdDate;
      const navigationPublishedRecordId = (await this._navigationRepository.save(navigationPublishedRecord)).id;
      
      let { id: __, ...containerLayoutPublishRecord } = navigations[0].containerLayout;
      containerLayoutPublishRecord.refId = navigationPublishedRecordId;
      await this._containerLayoutService.createObjectContainerLayout(containerLayoutPublishRecord);

      let { id: ___, ...containerStylePublishRecord } = navigations[0].containerStyle;
      containerStylePublishRecord.refId = navigationPublishedRecordId;
      await this._containerStyleService.createObjectContainerStyle(containerStylePublishRecord);

      let { id: ____, ...typographyStylePublishRecord } = navigations[0].typographyStyle;
      typographyStylePublishRecord.refId = navigationPublishedRecordId;
      await this._typographyStyleService.createObjectTypographyStyle(typographyStylePublishRecord);


      if (navigations[0].menu) {
        const menuPublishedRecordId = (await this._menuService.createMenu(navigationPublishedRecordId, navigations[0].menu.isVertical)).id;
        
        let { id: _, ...menuContainerLayoutPublishRecord } = navigations[0].menu.containerLayout;
        menuContainerLayoutPublishRecord.refId = menuPublishedRecordId;
        await this._containerLayoutService.createObjectContainerLayout(menuContainerLayoutPublishRecord);

        let { id: __, ...menuContainerStylePublishRecord } = navigations[0].menu.containerStyle;
        menuContainerStylePublishRecord.refId = menuPublishedRecordId;
        await this._containerStyleService.createObjectContainerStyle(menuContainerStylePublishRecord);
      }

      await this._navigationRepository.update(navigations[0].id, { unpublishedChanges: [] });
    }

    /* CASE 2 */
    else {
      const navigationPublishedRecord = navigations.find(obj => obj.isDraft === false)!;
      const navigationDraftRecord = navigations.find(obj => obj.isDraft === true)!;

      for (let relation of navigationDraftRecord!.unpublishedChanges) {
        if (relation === 'containerLayout') {
          const { id, refId, ...containerLayoutPropertiesToUpdate} = navigationDraftRecord.containerLayout;
          await this._containerLayoutService.updateByRefId(navigationPublishedRecord.id, containerLayoutPropertiesToUpdate);
        }

        if (relation === 'containerStyle') {
          const { id, refId, ...containerStylePropertiesToUpdate} = navigationDraftRecord.containerStyle;
          await this._containerStyleService.updateByRefId(navigationPublishedRecord.id, containerStylePropertiesToUpdate);
        }

        if (relation === 'typographyStyle') {
          const { id, refId, ...typographyStylePropertiesToUpdate} = navigationDraftRecord.typographyStyle;
          await this._typographyStyleService.updateByRefId(navigationPublishedRecord.id, typographyStylePropertiesToUpdate);
        }

        if (relation === 'menu' && navigationDraftRecord.menu) {
          // if no menu for publish record, we have to create it
          if (!navigationPublishedRecord.menu) {
            const menuPublishedRecordId = (await this._menuService.createMenu(navigationPublishedRecord.id, navigationDraftRecord.menu.isVertical)).id;

            let { id: _, ...menuContainerLayoutPublishRecord } = navigationDraftRecord.menu.containerLayout;
            menuContainerLayoutPublishRecord.refId = menuPublishedRecordId;
            await this._containerLayoutService.createObjectContainerLayout(menuContainerLayoutPublishRecord);

            let { id: __, ...menuContainerStylePublishRecord } = navigationDraftRecord.menu.containerStyle;
            menuContainerStylePublishRecord.refId = menuPublishedRecordId;
            await this._containerStyleService.createObjectContainerStyle(menuContainerStylePublishRecord);
          }
          // if menu exists for publish record, we have to update it
          else {
            const { id: _, refId: _r, ...containerLayoutPropertiesToUpdate } = navigationDraftRecord.menu.containerLayout;
            await this._containerLayoutService.updateByRefId(navigationPublishedRecord.menu.id, containerLayoutPropertiesToUpdate);

            const { id: __, refId: _r2, ...containerStylePropertiesToUpdate } = navigationDraftRecord.menu.containerStyle;
            await this._containerStyleService.updateByRefId(navigationPublishedRecord.menu.id, containerStylePropertiesToUpdate);
          }
        }

        if (relation === 'parent') {
          await this.copyDescendantAncestorIds(navigationGroupId, 'publish');
        }
      }

      let {
        id, isDraft, createdDate, createdBy, menu, containerLayout, containerStyle, typographyStyle,
        ...navigationPropertiesToUpdate 
      } = navigationDraftRecord!;

      navigationPropertiesToUpdate.unpublishedChanges = [];
      navigationPropertiesToUpdate.updatedBy = userId;
      navigationPropertiesToUpdate.updatedDate = new Date();
      await this._navigationRepository.update(navigationPublishedRecord.id, navigationPropertiesToUpdate);
      await this._navigationRepository.update(navigationDraftRecord.id, { unpublishedChanges: []});
    }

    return { message: 'Navigation published successfully.' };
  }

  /**
   * Mark navigation as dirty by adding relations to 'unpublishedChanges' array.
   * 
   * 1. Add relations to 'unpublishedChanges' keeping uniqueness.
   * 2. Update navigation with new 'unpublishedChanges' array.
   * 
   * @param navigation The navigation to mark as dirty.
   * @param relations The list of relations that have changed.
   */
  async markDirty(navigation: Navigation, relations: Array<string>) {
    /* 1. */
    const setOfFields = new Set(navigation.unpublishedChanges);
    relations.forEach(relation => setOfFields.add(relation));

    /* 2. */
    await this._navigationRepository.update(
      navigation.id,
      { unpublishedChanges: [...setOfFields] },
    );
  }

  /**
   * Retrieve navigations by their group id.
   *  
   * @param navigationGroupId The navigation group id.
   * @returns A promise of an array of 1 or 2 navigations.
   * @throws {NotFoundException} If no navigations found for this group id.
   */
  async getNavigationsByGroupId(navigationGroupId: string) {
    const navigations = await this._navigationRepository.find({
      relations: [
        'containerLayout',
        'containerStyle',
        'typographyStyle',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle',
        'menu.typographyStyle',
      ],
      take: 2, //only 2 navigations by groupId so improve query performance
      where: {
        groupId: navigationGroupId,
        deletedDate: IsNull()
      }
    });

    if (navigations.length === 0) {
      throw new NotFoundException(`No navigations found for groupId: ${navigationGroupId}`);
    }

    return navigations;
  }


  /**
   * Cancel navigation changes and return it.
   * 
   * 1. Get navigation draft and published versions from database.
   * 2. Update draft navigation relations (style and menu) with published ones.
   * 3. Update draft navigation properties with published ones.
   * 4. Return draft navigation updated.
   * 
   * @param navigationGroupId The navigation group id.
   * @param userId The user id from request.
   * @return A promise of the draft navigation where changes have been cancelled.
   * @throws {BadRequestException} if draft record or published record is not found.
   */
  async cancelNavigationChanges(
    navigationGroupId: string,
    userId: string
  ): Promise<Navigation | null> {
    /* 1. */
    const navigations = await this.getNavigationsByGroupId(navigationGroupId);
    const navigationPublishedRecord = navigations.find(obj => obj.isDraft === false);
    const navigationDraftRecord = navigations.find(obj => obj.isDraft === true);
    if (!navigationDraftRecord) {
      throw new BadRequestException('Navigation draft record not found.');
    }
    if (!navigationPublishedRecord) {
      throw new BadRequestException('An item which has never been published cannot be canceled. You have to delete it.');
    }

    /* 2. */
    for (let relation of navigationDraftRecord!.unpublishedChanges) {
      if (relation === 'containerLayout') {
        const { id, refId, ...containerLayoutPropertiesToUpdate} = navigationPublishedRecord.containerLayout;
        await this._containerLayoutService.updateByRefId(navigationDraftRecord.id, containerLayoutPropertiesToUpdate);
      }

      if (relation === 'containerStyle') {
        const { id, refId, ...containerStylePropertiesToUpdate} = navigationPublishedRecord.containerStyle;
        await this._containerStyleService.updateByRefId(navigationDraftRecord.id, containerStylePropertiesToUpdate);
      }

      if (relation === 'typographyStyle') {
        const { id, refId, ...typographyStylePropertiesToUpdate} = navigationPublishedRecord.typographyStyle;
        await this._typographyStyleService.updateByRefId(navigationDraftRecord.id, typographyStylePropertiesToUpdate);
      }

      if (relation === 'menu' && navigationDraftRecord.menu && navigationPublishedRecord.menu) {
        const { id: _, refId: _r, ...containerLayoutPropertiesToUpdate } = navigationPublishedRecord.menu.containerLayout;
        await this._containerLayoutService.updateByRefId(navigationDraftRecord.menu.id, containerLayoutPropertiesToUpdate);

        const { id: __, refId: _r2, ...containerStylePropertiesToUpdate } = navigationPublishedRecord.menu.containerStyle;
        await this._containerStyleService.updateByRefId(navigationDraftRecord.menu.id, containerStylePropertiesToUpdate);
      }

      if (relation === 'parent') {
        await this.copyDescendantAncestorIds(navigationGroupId, 'cancel');
      }
    }

    /* 3. */
    let {
      id, isDraft, createdDate, createdBy, menu, containerLayout, containerStyle, typographyStyle,
      ...navigationPropertiesToUpdate 
    } = navigationPublishedRecord;
    navigationPropertiesToUpdate.unpublishedChanges = [];
    navigationPropertiesToUpdate.updatedBy = userId;
    navigationPropertiesToUpdate.updatedDate = new Date();
    await this._navigationRepository.update(navigationDraftRecord.id, navigationPropertiesToUpdate);

    /* 4. */
    return this._navigationRepository.findOne({
      where: { id: navigationDraftRecord.id },
      relations: [
        'containerLayout',
        'containerStyle',
        'typographyStyle',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle'
      ]
    });    
  }

  /**
   * Get navigations where navigation type is redirect-button only.
   * 
   * @returns A promise of an array of redirect button navigations.
   */
  getRedirectButtons() {
    return this._navigationRepository.find({
      relations: ['navigationType'],
      where: {
        deletedDate: IsNull(),
        isDraft: true,
        navigationType: {
          name: 'redirect-button'
        }
      },
      order: {
        displayLabel: 'ASC'
      }
    })
  }

  /**
   * Generate the list of ancestor group ids for a given parent group id.
   * 
   * @param parentGroupId The group id of the parent.
   * @returns A promise of array of ancestor group ids.
   */
  async generateAncestorGroupIds(parentGroupId: string): Promise<Array<string>> {
    const navigation = await this._navigationRepository.findOne({
      select: { ancestorGroupIds: true },
      where: {
        groupId: parentGroupId,
        isDraft: true,
        deletedDate: IsNull()
      }
    });

    if (!navigation) {
      throw new NotFoundException(
        `Draft navigation with groupId ${parentGroupId} not found.`
      );
    }

    return [...navigation.ancestorGroupIds, parentGroupId];
  }

  /**
   * Update the ancestor group ids for all descendants of a navigation when its parent changes.
   * 
   * 1. Retrieve all descendants (draft) of the navigation provided.
   * 2. Remove the old ancestor group ids from each descendant's ancestorGroupIds.
   * 3. Add the new ancestor group ids to each descendant's ancestorGroupIds.
   * 4. Save the updated descendants back to the database.
   * 
   * @param navigation The navigation which parent will change.
   * @param newAncestorGroupIds The new list of ancestorGroupsIds for the navigation provided.
   */
  async updateDescendantAncestorGroupIds(
    navigation: Navigation,
    newAncestorGroupIds: Array<string>
  ) {
    /* 1. */
    const oldAncestorGroupIds = navigation.ancestorGroupIds;
    const draftDescendants = await this._navigationRepository.find({
      where: {
        ancestorGroupIds: ArrayContains([navigation.groupId]),
        isDraft: true,
        deletedDate: IsNull()
      }
    });

    draftDescendants.forEach(descendant => {
      /* 2. */
      descendant.ancestorGroupIds = descendant.ancestorGroupIds.filter(
        groupId => !oldAncestorGroupIds.includes(groupId)
      );
      /* 3. */
      descendant.ancestorGroupIds.push(...newAncestorGroupIds);
    });

    /* 4. */
    await this._navigationRepository.save(draftDescendants);
  }


  /**
   * 
   * Copy the ancestor group ids from the draft navigation records
   * to the published navigation records for a given navigation group id.
   * 
   * @param navigationGroupId The navigation group id used to find descendants.
   * @param type The type of operation to perform.
   */
  async copyDescendantAncestorIds(navigationGroupId: string, type: 'cancel' | 'publish') {
    const draftDescendants = await this._navigationRepository.find({
      where: {
        ancestorGroupIds: ArrayContains([navigationGroupId]),
        isDraft: true,
        deletedDate: IsNull()
      }
    });

    if (draftDescendants.length === 0) {
      return;
    }

    const publishDescendants = await this._navigationRepository.find({
      where: {
        ancestorGroupIds: ArrayContains([navigationGroupId]),
        isDraft: false,
        deletedDate: IsNull()
      }
    });

    const descendantsToUpdateByGroupId = new Map<string, Navigation>();
    if (type === 'cancel') {
      draftDescendants.forEach(descendant =>
        descendantsToUpdateByGroupId.set(descendant.groupId, descendant)
      );
    }
    else {
      publishDescendants.forEach(descendant =>
        descendantsToUpdateByGroupId.set(descendant.groupId, descendant)
      );
    }

    const descendantsToCopy = type === 'cancel' ? publishDescendants : draftDescendants;
    const descendantsToUpdate = descendantsToCopy.map(obj => {
      const descendant = descendantsToUpdateByGroupId.get(obj.groupId);
      if (!descendant) {
        throw new NotFoundException(
          `Published navigation with groupId ${obj.groupId} not found.`
        );
      }

      descendant.ancestorGroupIds = [...obj.ancestorGroupIds];
      return descendant;
    });

    await this._navigationRepository.save(descendantsToUpdate);
  }

}
