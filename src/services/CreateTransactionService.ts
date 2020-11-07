import { getRepository } from 'typeorm';
// import AppError from '../errors/AppError';

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

    const transactionRepository = getRepository(Transaction);

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
