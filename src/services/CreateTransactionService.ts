import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const checkBalance: boolean = await transactionRepository.checkBalance(
      type,
      value,
    );
    console.log(checkBalance);
    if (!checkBalance) {
      throw new AppError("You shouldn't expense more than you receive!");
    }

    let category_id: string;
    const categoryRepository = getRepository(Category);

    const categoryInDB = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryInDB) {
      const categoryNew = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryNew);
      category_id = categoryNew.id;
    } else {
      category_id = categoryInDB.id;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
