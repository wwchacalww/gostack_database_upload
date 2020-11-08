import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import Transaction from './Transaction';

@Entity('categories')
class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];
}

export default Category;
