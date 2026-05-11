import {
  PGVectorStore,
  type DistanceStrategy
} from '@langchain/community/vectorstores/pgvector'
import type { PoolConfig } from 'pg'
import { embeddings } from './embedding'
import { serverEnv } from './env/server'

const postgresConnectionOptions: PoolConfig = {
  host: serverEnv.dbHost,
  port: serverEnv.dbPort,
  user: serverEnv.dbUser,
  password: serverEnv.dbPassword,
  database: serverEnv.dbName
}
const config = {
  postgresConnectionOptions,
  preDeleteCollection: true,
  tableName: 'chunk',
  columns: {
    idColumnName: 'id',
    vectorColumnName: 'vector',
    contentColumnName: 'content',
    metadataColumnName: 'metadata'
  },
  // supported distance strategies: cosine (default), innerProduct, or euclidean
  distanceStrategy: 'cosine' as DistanceStrategy
}

export const vectorStore = await PGVectorStore.initialize(embeddings, config)
