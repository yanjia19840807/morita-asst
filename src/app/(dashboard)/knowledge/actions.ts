'use server'

import { KnowledgeCreateFormValues } from '@/schemas/knowledge'

export async function createKnowledgeAction(data: KnowledgeCreateFormValues) {
  console.log(data)
}
