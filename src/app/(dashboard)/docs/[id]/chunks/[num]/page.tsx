import React from "react";

export default async function DocChunkDetailPage({
  params,
}: {
  params: Promise<{ num: number }>;
}) {
  const { num } = await params;
  return <div>DocChunkDetailPage {num}</div>;
}
