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
  // Debug info
  const debugInfo = {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini",
    nodeEnv: process.env.NODE_ENV || "unknown",
  };

  console.log(`[BA-Agent] Running with config: ${JSON.stringify(debugInfo)}`);

  // Create a system prompt for the agent that directly incorporates the feature and repo
  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a Business Analyst who processes new feature requests and outputs scope, test cases, and schedules.
    
    A customer has requested this feature: "${feature}" in the repository "${repo}".
    
    YOUR GOAL: Provide a complete analysis including the following sections:
    1. Feature Summary (1-2 sentences describing the feature)
    2. Scope Estimation (small/medium/large)
    3. Implementation Details:
       - Backend changes required (specific files/components)
       - Frontend changes required (specific files/components)
       - Database changes if needed
    4. Timeline:
       - Estimated days for implementation (give a specific number)
       - Breakdown by component
    5. Testing Requirements (list 3-5 test cases)
    
    APPROACH: First, use available tools to gather necessary information. Then, analyze the information and provide your complete assessment.
    
    IMPORTANT: Be efficient with tool usage - make specific queries, avoid repetitive searches, and draw conclusions quickly from the information you gather.
    
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
    maxIterations: 10, // Increase from default (usually 4-6) to give agent more steps to complete task
    handleParsingErrors: true, // Better handling of parsing errors
    returnIntermediateSteps: true, // Return intermediate steps for debugging
  });

  // Run the agent with empty scratchpad since we've incorporated the feature info directly in the prompt
  let result;
  try {
    console.log("[BA-Agent] Invoking agent executor...");
    result = await executor.invoke({
      agent_scratchpad: "",
    });
    console.log("[BA-Agent] Agent execution completed successfully");
  } catch (error) {
    console.error("[BA-Agent] Error during agent execution:", error);
    // If there's an error, return a formatted error message instead of failing
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (errorMessage.includes("API key")) {
      return `<h1>API Configuration Error</h1><p>There was an issue with the OpenAI API key. Please check your environment configuration.</p>`;
    }

    if (
      errorMessage.includes("max iterations") ||
      errorMessage.includes("maximum iterations")
    ) {
      console.log("[BA-Agent] Agent hit max iterations limit");
      // Provide a more helpful message for max iterations error
      return `<h1>Analysis Timeout</h1>
      <p>The business analysis agent couldn't complete the analysis within the allowed number of steps. This usually happens when:</p>
      <ul>
        <li>The feature request is very complex</li>
        <li>The repository contains limited information</li>
        <li>More specific details are needed about the feature</li>
      </ul>
      <p>Please try again with a more specific feature description or provide additional details about what you're looking to build.</p>`;
    }

    return `<h1>Analysis Error</h1><p>Sorry, there was an error analyzing your request: ${errorMessage}</p>`;
  }

  // Format the output as plain text with HTML tags
  const formattedOutput = `
<h1>Business Analysis: ${feature}</h1>
<p>${result.output}</p>
  `.trim();

  // Return the formatted output directly to be displayed in the UI
  return formattedOutput;
};
