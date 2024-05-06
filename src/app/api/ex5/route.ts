// RAG resume loader example
// https://js.langchain.com/docs/integrations/document_loaders/file_loaders/directory
import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from "ai";
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

import { candidatesSchema } from "@/lib/schemas";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const loader = new DirectoryLoader("src/data/documents", {
  ".pdf": (path) => new PDFLoader(path),
  ".docx": (path) => new DocxLoader(path),
});

export const dynamic = "force-dynamic";

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE_RESUME = `Based on the resume and any additional research, answer the user's questions. If the resume does not contain the information required to answer or if no relevant data was found from additional sources, reply respectfully that the information is not available. Here's what we know:
  ==============================
  Resume Details:
  {context}
  ==============================
  Previous Conversation History:
  {chat_history}
  
  User's Question:
  {question}

  Assistant's Response:`;

// Also at the end of the message ask if the user wants to do a quick google search on the candidate.
// ==============================
// If the user says yes to this question display this and show relevant links:
// {google_search_results}
// ==============================

const SYSTEM_EXTRACTION_TEMPLATE = `You are an expert extraction algorithm for job resumes.
  Only extract relevant information from the text.
  If you do not know the value of an attribute asked to extract, you may omit the attribute's value.`;

async function performWebSearch(query: string) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&key=${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${
    process.env.GOOGLE_CUSTOM_SEARCH_API_CX
  }`;
  const response = await fetch(url);
  const data = await response.json();
  return data.items
    .map((item: any) => `${item.title}: ${item.link}`)
    .join("\n");
}

async function getWebLinks(
  model: ChatOpenAI<ChatOpenAICallOptions>,
  docs: any
) {
  // Extraction example ------
  const promptExtraction = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_EXTRACTION_TEMPLATE],
    ["human", "{text}"],
  ]);

  const extractionRunnable = promptExtraction.pipe(
    model.withStructuredOutput(candidatesSchema, { name: "candidate" })
  );

  // assuming the resume is one page
  const dataExtraction = await extractionRunnable.invoke({
    text: docs[0].pageContent,
  });

  console.log(dataExtraction.candidates);

  // assuming the candidates name is found
  const webResults = await performWebSearch(
    dataExtraction.candidates[0].name as string
  );
  return webResults;
  // --------------------------
}

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const docs = await loader.load();

    const prompt = PromptTemplate.fromTemplate(TEMPLATE_RESUME);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: "gpt-3.5-turbo",
      temperature: 0.4,
      streaming: true,
      verbose: true,
    });

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and encoding.
     */
    const parser = new HttpResponseOutputParser();

    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => formatDocumentsAsString(docs),
        // google_search_results: async (input) => {
        //   if (input.question.toLowerCase().includes("yes")) {
        //     return await getWebLinks(model, docs);
        //   }
        //   return "No additional search performed.";
        // },
      },
      prompt,
      model,
      parser,
    ]);

    // Convert the response into a friendly text-stream
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      question: currentMessageContent,
    });

    // Respond with the stream
    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer())
    );
  } catch (e: any) {
    return Response.json(
      { error: `Failed to process request: ${e.message}` },
      { status: e.status || 500 }
    );
  }
}
