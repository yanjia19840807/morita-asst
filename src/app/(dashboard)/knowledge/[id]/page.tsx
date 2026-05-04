import React from 'react'

export default async function KnowledgeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <div>KnowledgeDetailPage {id}</div>
}
