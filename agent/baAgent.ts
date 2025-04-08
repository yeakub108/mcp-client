// import { ChatOpenAI } from "@langchain/openai";
// import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
// import { config } from "dotenv";
// import { DynamicTool } from "langchain/tools";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { BaseChatModel } from "@langchain/core/language_models/chat_models";
// config();

// // 🛠 Import tools
// import { schedulerTool } from "./tools/scheduler";
// import { featureAnalyzerTool } from "./tools/featureAnalyzer";
// import { githubTool } from "./tools/github";

// // Convert simple tools to LangChain Tool instances
// const convertToLangChainTool = (simpleTool: any) => {
//   return new DynamicTool({
//     name: simpleTool.name,
//     description: simpleTool.description,
//     func: async (input: string) => {
//       return await simpleTool.func(input);
//     },
//   });
// };

// const model = new ChatOpenAI({
//   temperature: 0,
//   modelName: "gpt-4o-mini",
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Convert tools to LangChain format
// const langChainTools = [
//   convertToLangChainTool(githubTool),
//   convertToLangChainTool(featureAnalyzerTool),
//   convertToLangChainTool(schedulerTool),
// ];

// export const runBAAgent = async ({
//   feature,
//   repo,
// }: {
//   feature: string;
//   repo: string;
// }) => {
//   // Create a system prompt for the agent
//   const prompt = ChatPromptTemplate.fromTemplate(
//     `You are a Business Analyst who processes new feature requests and outputs scope, test cases, and schedules.

//     Here is the current information: {agent_scratchpad}`
//   );

//   // Create the agent
//   const agent = await createOpenAIFunctionsAgent({
//     llm: model as unknown as BaseChatModel,
//     tools: langChainTools,
//     prompt,
//   });

//   // Create the executor with our agent and tools
//   const executor = new AgentExecutor({
//     agent,
//     tools: langChainTools,
//     verbose: true,
//   });

//   // The input to the agent, including the feature and repository
//   const result = await executor.invoke({
//     agent_scratchpad: `A customer requested this feature: "${feature}" in the repo "${repo}". Estimate the scope, backend/frontend impact, and how many days needed.`,
//   });

//   return result;
// };

import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { config } from "dotenv";
import { DynamicTool } from "langchain/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
config();

// 🛠 Import tools
import { schedulerTool } from "./tools/scheduler";
import { featureAnalyzerTool } from "./tools/featureAnalyzer";
import { githubTool } from "./tools/github";

// Convert simple tools to LangChain Tool instances
const convertToLangChainTool = (simpleTool: any) => {
  return new DynamicTool({
    name: simpleTool.name,
    description: simpleTool.description,
    func: async (input: string) => {
      return await simpleTool.func(input);
    },
  });
};

const model = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

// Convert tools to LangChain format
const langChainTools = [
  convertToLangChainTool(githubTool),
  convertToLangChainTool(featureAnalyzerTool),
  convertToLangChainTool(schedulerTool),
];

export const runBAAgent = async ({
  feature,
  repo,
}: {
  feature: string;
  repo: string;
}) => {
  // Create a system prompt for the agent that directly incorporates the feature and repo
  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a Business Analyst who processes new feature requests and outputs scope, test cases, and schedules.
    
    A customer has requested this feature: "${feature}" in the repository "${repo}".
    
    Please analyze this request and provide:
    - Scope estimation
    - Backend/frontend impact analysis
    - Number of days needed for implementation
    
    Use the available tools to gather information needed for your analysis.
    
    {agent_scratchpad}`
  );

  // Create the agent
  const agent = await createOpenAIFunctionsAgent({
    llm: model as unknown as BaseChatModel,
    tools: langChainTools,
    prompt,
  });

  // Create the executor with our agent and tools
  const executor = new AgentExecutor({
    agent,
    tools: langChainTools,
    verbose: true,
  });

  // Run the agent with empty scratchpad since we've incorporated the feature info directly in the prompt
  const result = await executor.invoke({
    agent_scratchpad: "",
  });

  // Format the output as plain text with HTML tags, but without any JSON formatting
  const formattedOutput = `
<h1>Business Analysis: ${feature}</h1>
<p>${result.output}</p>
  `.trim();

  // Return only the formatted text string, not wrapped in JSON
  return formattedOutput;
};

// Example usage
// runBAAgent({
//   feature: "Add About Page",
//   repo: "yeakub108/abc-web"
// }).then(output => {
//   console.log(output);  // This will log only the text with HTML tags, no JSON
// });
