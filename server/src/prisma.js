/**
 * PRISMA CLIENT SINGLETON INSTANCE
 * Handles resolution from both root node_modules and server node_modules
 */

const path = require('path');

let PrismaClient;

try {
  // Strategy 1: Check root node_modules (where prisma generate typically emits in monorepo)
  const rootClient = require(path.resolve(__dirname, '../../node_modules/@prisma/client'));
  new rootClient.PrismaClient();
  PrismaClient = rootClient.PrismaClient;
} catch (e) {
  try {
    // Strategy 2: Check standard package resolution
    const localClient = require('@prisma/client');
    new localClient.PrismaClient();
    PrismaClient = localClient.PrismaClient;
  } catch (e2) {
    PrismaClient = require('@prisma/client').PrismaClient;
  }
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

module.exports = prisma;

