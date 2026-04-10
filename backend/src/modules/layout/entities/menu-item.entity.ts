import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { MenuEntity } from './menu.entity';

/**
 * Entity cms_menu_item — item trong menu (ho tro 2 cap)
 */
@Entity('cms_menu_item')
export class MenuItemEntity {
  @PrimaryColumn('char', { length: 36, name: 'cms_menu_item_id', default: () => '(UUID())' })
  cmsMenuItemId!: string;

  @Column({ name: 'cms_menu_id', type: 'char', length: 36 })
  cmsMenuId!: string;

  @Column({ name: 'cms_menu_item_parent_id', type: 'char', length: 36, nullable: true })
  cmsMenuItemParentId!: string | null;

  @Column({ name: 'cms_menu_item_label', type: 'varchar', length: 100 })
  cmsMenuItemLabel!: string;

  @Column({ name: 'cms_menu_item_type', type: 'varchar', length: 20, default: 'url' })
  cmsMenuItemType!: string;

  @Column({ name: 'cms_menu_item_value', type: 'varchar', length: 255 })
  cmsMenuItemValue!: string;

  @Column({ name: 'cms_menu_item_icon', type: 'varchar', length: 50, nullable: true })
  cmsMenuItemIcon!: string | null;

  @Column({ name: 'cms_menu_item_badge', type: 'varchar', length: 20, nullable: true })
  cmsMenuItemBadge!: string | null;

  @Column({ name: 'cms_menu_item_open_new_tab', type: 'tinyint', default: 0 })
  cmsMenuItemOpenNewTab!: number;

  @Column({ name: 'cms_menu_item_mobile_visible', type: 'tinyint', default: 1 })
  cmsMenuItemMobileVisible!: number;

  @Column({ name: 'cms_menu_item_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  cmsMenuItemSort!: number;

  @ManyToOne(() => MenuEntity, (menu) => menu.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cms_menu_id' })
  menu!: MenuEntity;

  @ManyToOne(() => MenuItemEntity, (parent) => parent.children, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'cms_menu_item_parent_id' })
  parent!: MenuItemEntity | null;

  @OneToMany(() => MenuItemEntity, (child) => child.parent)
  children!: MenuItemEntity[];
}
