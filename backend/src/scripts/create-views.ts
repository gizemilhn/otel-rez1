import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function createViews() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'create-views.sql'),
      'utf8'
    );

    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
      console.log('Executed statement successfully');
    }

    console.log('Views created successfully');
  } catch (error) {
    console.error('Error creating views:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createViews(); 