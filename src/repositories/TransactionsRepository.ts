import { EntityRepository, getRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let income = 0;
    let outcome = 0;

    const transactionsRepository = getRepository(Transaction);

    const transactions = await transactionsRepository.find();

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += Number(transaction.value);
      }

      if (transaction.type === 'outcome') {
        outcome += Number(transaction.value);
      }
    });

    const total = Number((income - outcome).toFixed(2));

    const balance: Balance = {
      income,
      outcome,
      total,
    };
    return balance;
  }

  public async checkBalance(type: string, value: number): Promise<boolean> {
    const { total, outcome } = await this.getBalance();
    const outcomeNow = outcome + value;
    if (type === 'outcome' && total > outcomeNow) {
      return true;
    }

    if (type === 'income') {
      return true;
    }

    return false;
  }
}

export default TransactionsRepository;
