import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { serverEnv } from './env/server'

const adapter = new PrismaPg({ connectionString: serverEnv.databaseUrl })
const prisma = new PrismaClient({ adapter })

export { prisma }
