const { PrismaClient } = require('./generated/prisma');

// Single shared Prisma client instance for the whole app.
const prisma = new PrismaClient();

module.exports = prisma;
