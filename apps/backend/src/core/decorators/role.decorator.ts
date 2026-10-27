import { Reflector } from '@nestjs/core';

export const Action = Reflector.createDecorator<'view' | 'add' | 'edit' | 'delete'>();

/** /!\ Feature name shall match entity class name. */
export const Feature = Reflector.createDecorator<string>();

/** /!\ NavigationTypeName shall match name in navigation_type table. */ 
export const NavigationTypeNameArray = Reflector.createDecorator<Array<string>>();


