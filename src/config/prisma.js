require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaMySQL } = require('@prisma/adapter-mysql');


const adapter = new PrismaMySQL({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export { prisma };