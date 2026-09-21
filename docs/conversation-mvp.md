# 会话功能模块 MVP 设计

## 1. 目标

在现有后台中补齐“会话”能力，让管理员可以选择一个已配置好的助手发起多轮对话，并复用现有的提示词、知识库和模型配置。

MVP 目标只覆盖以下能力：

- 基于 `Agent` 发起会话
- 支持多轮消息历史
- 支持基于 `Knowledge` 的 RAG 检索
- 支持流式返回回答
- 支持回答引用来源 Chunk
- 支持会话列表、消息列表、继续追问

MVP 明确不做：

- 复杂工具调用
- 多 Agent 编排
- 人设长期记忆
- 自动会话摘要压缩
- LangGraph 级别工作流
- 用户端 IM 级别实时协作

## 2. 现状约束

仓库里已经有三块可直接复用的基础能力：

1. `Agent` 已绑定 `model`、`promptProfileId`、`knowledgeId`
2. `PromptProfile.systemPrompt` 已可作为系统提示词来源
3. `Knowledge -> KnowledgeDoc -> Chunk -> vector` 已完成切分和向量入库

已确认的实现锚点：

- 模型实例目前在 `src/modules/agents/models/chat-deep-seek.ts`
- 向量库封装在 `src/lib/vector-store.ts`
- 文档切分和入库在 `src/modules/knowledges/indexing/workers/process-doc.ts`
- API 风格为 `withRole + handleApiResult/handleApiError`

仓库当前没有真正的业务会话模型，也没有流式 LLM 输出路由，所以会话模块本质上是新增一条从“Agent 配置”到“RAG 对话执行”的业务链路。

## 3. MVP 用户流程

### 3.1 发起会话

1. 管理员进入“会话”页
2. 选择一个 `Agent`
3. 输入首条消息
4. 系统创建会话并开始流式回答

### 3.2 继续追问

1. 前端加载当前会话消息
2. 用户继续输入问题
3. 服务端读取最近几轮消息历史
4. 如果 Agent 绑定了知识库，则执行检索
5. 将系统提示词、历史消息、检索上下文、用户问题一起送入模型
6. 流式输出答案
7. 回答结束后持久化 assistant 消息和引用来源

## 4. LangChain 组件选型

MVP 只组合最必要的 LangChain 组件，不引入 LangGraph。

### 4.1 Chat Model

用途：统一模型调用入口

建议：

- 默认继续使用 `ChatDeepSeek`
- 根据 `agent.model` 补一个模型工厂，后续可扩展 `ChatOpenAI`

建议新增：

- `src/modules/conversations/llm.ts`

职责：

- 根据 Agent 配置返回具体 `BaseChatModel`
- 统一温度、超时、重试配置

### 4.2 Prompt 组装

用途：把系统提示词、历史消息、RAG 上下文和当前问题装配为最终 prompt

建议使用：

- `ChatPromptTemplate`
- `SystemMessagePromptTemplate`
- `HumanMessagePromptTemplate`
- `MessagesPlaceholder`

建议模板：

```txt
system:
你是一个后台助手。
{systemPrompt}

如果提供了参考资料，请优先基于参考资料回答；若资料不足，明确说明。

history:
{history}

human:
参考资料：
{context}

用户问题：
{input}
```

这样做的原因：

- `PromptProfile.systemPrompt` 可以直接进入 `systemPrompt`
- 历史消息通过 `MessagesPlaceholder('history')` 注入
- RAG 内容只作为上下文，不污染消息历史

### 4.3 Retriever

用途：从现有 `Chunk` 向量表中取与问题最相关的片段

建议优先使用：

- `PrismaVectorStore` 返回的 `asRetriever()`
- 或一个轻量自定义 `BaseRetriever`

MVP 推荐方案：

1. 新增 `buildKnowledgeRetriever(knowledgeId)`
2. 根据 `knowledgeId` 找出可用的 `knowledgeDocId`
3. 在检索时限定只命中该知识库下的 Chunk
4. 返回前 4 到 6 条结果

原因：

- 现有数据模型的知识库边界清晰
- `Chunk` 已有 `knowledgeDocId` 和 `metadata`
- 先做单知识库检索，逻辑最稳

如果 `PrismaVectorStore`
对过滤条件支持不够稳定，MVP 可接受一个“LangChain 外围包裹 + 自定义检索实现”的折中方案：

- 向量相似度仍走当前 embedding/vector 表
- 过滤和组装逻辑放在会话模块自己的 service/retriever 里

### 4.4 Runnable 组合

用途：把输入预处理、检索、Prompt 装配、模型调用串起来

建议使用：

- `RunnableSequence`
- `RunnableParallel`

推荐链路：

```ts
input
-> RunnableParallel({
     input,
     history,
     context,
     systemPrompt
   })
-> ChatPromptTemplate
-> model
```

其中：

- `history` 来自数据库最近 N 条消息
- `context` 来自 retriever
- `systemPrompt` 来自 `PromptProfile`

MVP 不建议一开始就上
`RunnableWithMessageHistory`。原因不是它不能用，而是当前仓库还没有自己的 message
history adapter；先手动读写消息表，边界更清楚，排错成本更低。

### 4.5 Output Parser

MVP 不强依赖结构化输出。

建议：

- 主回答直接流式输出文本
- 引用来源单独由服务端依据 retriever 命中结果落库

这样比让模型自己返回 JSON 更稳，尤其是在首版需要先把流式交互跑通时。

## 5. 数据模型设计

建议新增 3 张业务表。

### 5.1 Conversation

表示一条会话主线。

字段建议：

- `id`
- `userId`
- `agentId`
- `title`：默认取首条消息前 20 到 30 个字
- `status`：`ACTIVE | ARCHIVED`
- `lastMessageAt`
- `createdAt`
- `updatedAt`

### 5.2 ConversationMessage

表示每一轮用户或助手消息。

字段建议：

- `id`
- `conversationId`
- `role`：`USER | ASSISTANT | SYSTEM`
- `content`
- `status`：`PENDING | STREAMING | COMPLETED | FAILED`
- `model`
- `promptProfileSnapshot`：可选，保留当时 system prompt 快照
- `knowledgeSnapshot`：可选，保留当时 knowledge 配置快照
- `errorMessage`
- `createdAt`
- `updatedAt`

MVP 先不拆 token usage 表，必要时可在消息表上加：

- `inputTokens`
- `outputTokens`

### 5.3 ConversationMessageSource

表示 assistant 回答引用了哪些 Chunk。

字段建议：

- `id`
- `messageId`
- `chunkId`
- `knowledgeDocId`
- `score`
- `quote`
- `sortOrder`

这样做的价值：

- 可直接回溯到现有 `Chunk`
- 前端能展示“回答依据”
- 后续做命中分析和调优有基础数据

### 5.4 Prisma 关系建议

- `User 1 - n Conversation`
- `Agent 1 - n Conversation`
- `Conversation 1 - n ConversationMessage`
- `ConversationMessage 1 - n ConversationMessageSource`
- `ConversationMessageSource n - 1 Chunk`

## 6. 模块分层设计

建议新增 `src/modules/conversations`。

目录建议：

```txt
src/modules/conversations/
  actions.ts
  dto.ts
  mapper.ts
  repository.ts
  schemas.ts
  service.ts
  chain.ts
  retriever.ts
  stream.ts
```

职责建议：

- `schemas.ts`：入参校验
- `repository.ts`：Conversation/Message/Source 持久化
- `service.ts`：业务 orchestration
- `retriever.ts`：知识库检索封装
- `chain.ts`：LangChain prompt/runnable/model 编排
- `stream.ts`：流式输出协议适配
- `dto.ts` / `mapper.ts`：API 返回结构

## 7. API 设计

MVP 推荐 4 个接口。

### 7.1 `POST /api/conversations`

用途：创建会话

请求：

```json
{
  "agentId": "...",
  "title": "可选"
}
```

返回：

- 会话基础信息

### 7.2 `GET /api/conversations`

用途：分页获取会话列表

查询参数：

- `page`
- `pageSize`
- `agentId` 可选
- `searchValue` 可选

### 7.3 `GET /api/conversations/[id]`

用途：获取会话详情和消息列表

返回：

- 会话信息
- 最近消息列表
- 每条 assistant 消息的引用来源

### 7.4 `POST /api/conversations/[id]/messages`

用途：发送消息并流式返回回答

请求：

```json
{
  "content": "用户输入的问题"
}
```

处理步骤：

1. 校验会话归属和 Agent 可用性
2. 落一条 user message
3. 预创建 assistant message，状态为 `STREAMING`
4. 读取最近消息历史
5. 执行 RAG 检索
6. 调用 LangChain 链并流式输出 token
7. 结束后更新 assistant message 内容和状态
8. 落库命中的 sources

返回协议建议：

- 首版直接使用 `text/event-stream`

事件建议：

- `start`
- `token`
- `sources`
- `done`
- `error`

## 8. 运行链路设计

### 8.1 创建链输入

服务端先整理出统一输入：

```ts
type ConversationChainInput = {
  input: string
  systemPrompt: string
  history: BaseMessage[]
  context: string
}
```

### 8.2 历史消息裁剪

MVP 只取最近 12 到 20 条消息，避免 prompt 无限增长。

规则建议：

- 只保留 `USER` 和 `ASSISTANT`
- `FAILED` 消息不进入 history
- 超长消息可按字符数截断

### 8.3 RAG 上下文格式化

retriever 返回的 Chunk 建议整理成：

```txt
[1] 文档: xxx.pdf
内容: ...

[2] 文档: yyy.pdf
内容: ...
```

这样既便于模型引用，也便于后端同步保存 sources。

### 8.4 流式持久化策略

建议不要每个 token 都写数据库。

MVP 做法：

1. assistant message 先写一条空内容
2. 内存中累计 streamed text
3. 流结束后一次性 update message.content

这样数据库压力最小，也更容易保证一致性。

## 9. 前端 MVP 设计

建议新增一个独立页面，而不是先塞进 Agent 管理页。

页面结构：

- 左侧：会话列表
- 中间：消息流
- 底部：输入框
- 顶部：当前 Agent、知识库、PromptProfile 摘要
- assistant 消息下方：引用来源折叠面板

建议路由：

- `src/app/(dashboard)/conversations/page.tsx`
- `src/app/(dashboard)/conversations/[id]/page.tsx`

MVP UI 交互：

- 可新建会话
- 可切换历史会话
- 可发送消息
- 可看到流式回答
- 可查看引用来源

先不做：

- 会话重命名
- 消息编辑重试
- 多标签并发会话同步

## 10. 服务层伪代码

```ts
async function sendMessage(conversationId: string, content: string) {
  const conversation = await getConversationForUser(conversationId, userId)
  const agent = await getConversationAgent(conversation.agentId)

  const userMessage = await createUserMessage({ conversationId, content })
  const assistantMessage = await createAssistantPlaceholder({ conversationId })

  const history = await getRecentMessages(conversationId)
  const retriever = agent.knowledgeId
    ? await buildKnowledgeRetriever(agent.knowledgeId)
    : null

  const docs = retriever ? await retriever.invoke(content) : []
  const context = formatDocsAsContext(docs)

  const chain = await buildConversationChain({ agent, systemPrompt, history })

  let finalText = ''
  for await (const chunk of chain.stream({
    input: content,
    history,
    context
  })) {
    finalText += chunk
    emitToken(chunk)
  }

  await completeAssistantMessage(assistantMessage.id, finalText)
  await saveMessageSources(assistantMessage.id, docs)

  return { userMessage, assistantMessage }
}
```

## 11. 为什么这是合适的 MVP

这个方案的核心是“少引入新概念，最大复用现有资产”。

优点：

- 直接复用已有 `Agent / PromptProfile / Knowledge / Chunk`
- LangChain 只负责最关键的 prompt、retrieval、model、runnable
- 会话持久化走现有 Prisma 习惯，容易维护
- 没有把首版复杂度浪费在 tool calling 和 workflow graph 上
- 后续往 LangGraph、Tool Calling、会话摘要扩展都不冲突

## 12. 第二阶段演进方向

MVP 稳定后再考虑：

1. 增加 `RunnableWithMessageHistory` 适配器
2. 增加工具调用，例如查询知识库统计、文档详情
3. 增加会话标题自动生成
4. 增加历史摘要压缩，降低 token 消耗
5. 增加消息反馈和命中质量评估
6. 按 `agent.model` 动态切换 DeepSeek/OpenAI
7. 升级为 LangGraph 节点式执行流

## 13. 实施顺序建议

按最短可运行路径拆分：

1. Prisma 新增 `Conversation / ConversationMessage / ConversationMessageSource`
2. 补 `src/modules/conversations/repository.ts`
3. 补 `retriever.ts`，先打通知识库过滤检索
4. 补 `chain.ts`，实现 prompt + model + stream
5. 补 `POST /api/conversations/[id]/messages`
6. 做最小前端页面，先跑通发消息和流式展示
7. 最后补会话列表、引用展示和异常处理

## 14. 落地注意事项

- 当前仓库 Prisma
  migration 链已有历史问题，新增会话表时应优先采用可控的手工 migration 方案，并至少执行一次
  `npx prisma generate`
- Next
  16 当前仓库对 server-only 包的 bundling 较敏感，LangChain 相关服务代码应放在服务端模块内，不要泄漏到 client
  component
- 首版务必把“消息持久化”和“流式返回”分成清晰两层，避免接口和数据库状态互相耦合
