// RAG resume loader as agent example
// https://js.langchain.com/docs/modules/agents/tools/dynamic
import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from "ai";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { createRetrieverTool } from "langchain/tools/retriever";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const loader = new DirectoryLoader("src/data/documents", {
  ".pdf": (path) => new PDFLoader(path),
  ".docx": (path) => new DocxLoader(path),
});

export const dynamic = "force-dynamic";

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const AGENT_SYSTEM_TEMPLATE = `You are a recruiting expert.

  Use all available tools to answer the user's questions about a candidate, including resume details and broader internet searches.
  
  If specific information is not available in the resume or through internet searches, reply respectfully that it cannot be found.
  
  Prioritize resume data but do not hesitate to search the web for supplementary information.`;

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const body = await req.json();

    // define messages and history
    const messages = (body.messages ?? []).filter(
      (message: VercelChatMessage) =>
        message.role === "user" || message.role === "assistant"
    );
    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    // define the model
    const agentModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      streaming: true,
      verbose: true,
    });

    // tools
    const docs = await loader.load();
    const vectorstore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );
    const retriever = vectorstore.asRetriever();
    const retrieverTool = createRetrieverTool(retriever, {
      name: "resume_search",
      description: "Search for detailed resume information.",
    });

    // define tools
    const tools = [retrieverTool, new TavilySearchResults({ maxResults: 20 })];

    // define prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", AGENT_SYSTEM_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // create runnable
    const agent = await createToolCallingAgent({
      llm: agentModel,
      tools,
      prompt,
    });

    // create agent
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
    });

    // Run agent and convert the response into a friendly text-stream
    const logStream = await agentExecutor.streamLog({
      input: currentMessageContent,
      chat_history: previousMessages,
    });

    // Respond with the stream, use this for agents
    const textEncoder = new TextEncoder();
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of logStream) {
          if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
            const addOp = chunk.ops[0];
            if (
              addOp.path.startsWith("/logs/ChatOpenAI") &&
              typeof addOp.value === "string" &&
              addOp.value.length
            ) {
              controller.enqueue(textEncoder.encode(addOp.value));
            }
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(
      transformStream.pipeThrough(createStreamDataTransformer())
    );
  } catch (e: any) {
    return Response.json(
      { error: `Failed to process request: ${e.message}` },
      { status: e.status || 500 }
    );
  }
}
