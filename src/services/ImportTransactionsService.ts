import { getRepository, In } from 'typeorm';
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionsDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(csvFilename: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const filePath = path.join(uploadConfig.directory, csvFilename);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const categories: string[] = [];

    const transactionsArray: TransactionsDTO[] = [];
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value || !category) return;

      categories.push(category);
      transactionsArray.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesExists = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const categoriesExistsTitles = categoriesExists.map(
      (category: Category) => category.title,
    );

    const addCategoriesTitle = categories
      .filter(category => !categoriesExistsTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const categoriesNew = categoriesRepository.create(
      addCategoriesTitle.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(categoriesNew);

    const categoriesFinal = [...categoriesNew, ...categoriesExists];

    const transactionsCSV = transactionsRepository.create(
      transactionsArray.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: categoriesFinal.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(transactionsCSV);

    await fs.promises.unlink(filePath);

    return transactionsCSV;
  }
}

export default ImportTransactionsService;
