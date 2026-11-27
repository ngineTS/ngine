import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class BulkUpdateNavigationDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  parentGroupId: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;
}
