export const featureAnalyzerTool = {
  name: "analyze_feature_scope",
  description: "Estimate complexity, number of UI/backend components affected.",
  func: async (feature: string) => {
    // Simulated logic - you can use OpenAI call here too
    if (feature.toLowerCase().includes("about page")) {
      return `This feature affects 1 frontend component and is low complexity.`;
    } else {
      return `Medium complexity. Estimated impact: 3 UI components and 2 backend routes.`;
    }
  },
};
