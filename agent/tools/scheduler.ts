export const schedulerTool = {
  name: "auto_schedule_feature",
  description:
    "Estimate how many days the feature will take based on complexity and workload.",
  func: async (feature: string) => {
    // This now returns open-ended responses that let the AI model determine the days
    // based on its assessment of the feature complexity
    return `Based on analysis of the feature "${feature}", please determine appropriate timeline in work days.`;
  },
};
