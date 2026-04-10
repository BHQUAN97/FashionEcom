import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';

/**
 * Entity cms_menu — menu chinh (header, footer, mobile)
 */
@Entity('cms_menu')
export class MenuEntity {
  @PrimaryColumn('char', { length: 36, name: 'cms_menu_id', default: () => '(UUID())' })
  cmsMenuId!: string;

  @Column({ name: 'cms_menu_type', type: 'varchar', length: 20 })
  cmsMenuType!: string;

  @Column({ name: 'cms_menu_name', type: 'varchar', length: 100 })
  cmsMenuName!: string;

  @Column({ name: 'cms_menu_status', type: 'tinyint', default: 1 })
  cmsMenuStatus!: number;

  @OneToMany(() => MenuItemEntity, (item) => item.menu)
  items!: MenuItemEntity[];
}
