import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Request } from 'express';
import { RoleNavigationPermission } from 'src/domains/role-navigation-permission/entities/role-navigation-permission.entity';


@Injectable()
export class AuthService {

  constructor(
    private _jwtService: JwtService,
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    private _dataSource: DataSource
  ) {}

  /**
   * Sign guest in.
   * 
   * @returns The JWT guest authentication token
   */
  async guestSignIn() {
    const guestUser = await this._userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.userRoles',
        'userRoles',
        'userRoles.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'userRoles.role',
        'role',
        'role.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'role.roleNavigationPermissions',
        'roleNavigationPermissions',
        'roleNavigationPermissions.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'roleNavigationPermissions.permission',
        'permission',
        'permission.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'roleNavigationPermissions.navigation',
        'navigation',
        'navigation.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'navigation.navigationType',
        'navigationType',
      )
      .where('user.name = :guestName', { guestName: 'guest' })
      .andWhere('user.deletedDate IS NULL')
      .getOne();
    
    if (!guestUser) {
      throw new NotFoundException('No guest user found.');
    }

    const userNavigationPermissions = this.extractUserNavigationPermissions(guestUser);

    const payload = {
      sub: guestUser.id,
      userEmail: guestUser.emailAddress,
      userNavigationPermissions: userNavigationPermissions
    };

    /* return access token. */
    const accessToken = await this.getAccessToken(payload);
    return { access_token: accessToken };
  }

  /**
   * Sign user in.
   * 
   * @param emailAddress The user email address.
   * @param password The user password.
   * @returns The JWT authentication token.
   */
  async signIn(emailAddress: string, password: string) {
    const user = await this._userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.userRoles',
        'userRoles',
        'userRoles.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'userRoles.role',
        'role',
        'role.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'role.roleNavigationPermissions',
        'roleNavigationPermissions',
        'roleNavigationPermissions.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'roleNavigationPermissions.permission',
        'permission',
        'permission.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'roleNavigationPermissions.navigation',
        'navigation',
        'navigation.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'navigation.navigationType',
        'navigationType',
      )
      .where('user.emailAddress = :emailAddress', {
        emailAddress: emailAddress.toLowerCase()
      })
      .andWhere('user.deletedDate IS NULL')
      .getOne();
    
    if (!user) {
      throw new NotFoundException("This email address doesn't exist.");
    }

    if (user.isDisabled) {
      throw new UnauthorizedException("This user has been disabled.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException("Your password is incorrect.");
    }

    const userNavigationPermissions = this.extractUserNavigationPermissions(user);

    const payload = {
      sub: user.id,
      userEmail: user.emailAddress,
      userNavigationPermissions: userNavigationPermissions
    };

    /* Return access token. */
    const accessToken = await this.getAccessToken(payload);
    return { access_token: accessToken };
  }

  /**
   * Refresh authentication token.
   * 
   * Get and verify token from request.
   * If it is valid then generate new access token, else throw UnauthorizedException.
   * 
   * @param req The request object.
   * @returns The new access token.
   */
  async refresh(req: Request) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this._jwtService.verifyAsync(token, { 
      secret: process.env.JWT_SECRET 
    });
    if (!payload) {
      throw new UnauthorizedException();
    }
    
    const accessToken = await this.getAccessToken({
      sub: payload['sub'],
      userEmail: payload['userEmail'],
      userNavigationPermissions: payload['userNavigationPermissions']
    });

    return { access_token: accessToken };
  }

  /**
   * Get new access token from Jwt.
   * 
   * @param payload Payload to pass to jwt sign in.
   * @returns A promise of the access token.
   */
  async getAccessToken(
    payload: {
      sub: string, 
      userEmail: string
      userNavigationPermissions: Array<RoleNavigationPermission>
    }
  ): Promise<string> {
    return this._jwtService.signAsync(payload);
  }

  /**
   * Extract Bearer token from request.
   * 
   * @param request The request.
   * @returns The token.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async getAuthPacks(): Promise<
    Array<{
      id: string;
      navigationId: string;
      name: string;
      description: string;
      order: number;
      price: number;
      currency: string;
      roleId: string;
      stripePriceId: string;
      isRecurringPayment: boolean;
      interval: string;
      isFree: boolean;
    }>
  > {
    return this._dataSource.createQueryBuilder()
      .select('*')
      .from(`${process.env.DB_SCHEMA}.auth_pack`, 'authPack')
      .orderBy('"order"', 'ASC')
      .execute();
  }

  /**
   * Extract role navigation permissions from user roles.
   * 
   * @param user The user.
   * @returns An array of role navigation permissions.
   */
  extractUserNavigationPermissions(user: User): Array<RoleNavigationPermission> {
    const userRoleNavigationPermissionsByNavigationGroupId = new Map<string, RoleNavigationPermission>();
    
    user.userRoles.forEach(userRole => {
      userRole.role.roleNavigationPermissions.forEach(rnp => {
        const existingNavigation = userRoleNavigationPermissionsByNavigationGroupId.get(rnp.navigationGroupId);  
        if (!existingNavigation || rnp.permission.priority < existingNavigation.permission.priority) {
          userRoleNavigationPermissionsByNavigationGroupId.set(rnp.navigationGroupId, rnp);
        }
      });
    });

    return Array.from(userRoleNavigationPermissionsByNavigationGroupId.values());
  }

}
