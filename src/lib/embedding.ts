import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import { serverEnv } from './env/server'

export const embeddings = new AlibabaTongyiEmbeddings({
	apiKey: serverEnv.tongyiEmbeddingsApiKey
})
