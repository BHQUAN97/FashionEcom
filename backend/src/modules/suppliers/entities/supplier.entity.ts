import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('inv_supplier')
export class SupplierEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_supplier_id', default: () => '(UUID())' })
  invSupplierId!: string;

  @Column({ name: 'inv_supplier_code', type: 'varchar', length: 20 })
  invSupplierCode!: string;

  @Column({ name: 'inv_supplier_name', type: 'varchar', length: 255 })
  invSupplierName!: string;

  @Column({ name: 'inv_supplier_tax_code', type: 'varchar', length: 50, nullable: true })
  invSupplierTaxCode!: string | null;

  @Column({ name: 'inv_supplier_address', type: 'varchar', length: 255, nullable: true })
  invSupplierAddress!: string | null;

  @Column({ name: 'inv_supplier_contact_name', type: 'varchar', length: 100, nullable: true })
  invSupplierContactName!: string | null;

  @Column({ name: 'inv_supplier_phone', type: 'varchar', length: 50, nullable: true })
  invSupplierPhone!: string | null;

  @Column({ name: 'inv_supplier_email', type: 'varchar', length: 100, nullable: true })
  invSupplierEmail!: string | null;

  @Column({ name: 'inv_supplier_payment_terms', type: 'varchar', length: 50, nullable: true })
  invSupplierPaymentTerms!: string | null;

  @Column({ name: 'inv_supplier_status', type: 'tinyint', default: 1 })
  invSupplierStatus!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'updated_date', type: 'datetime', nullable: true })
  updatedDate!: Date | null;
}
