export const schedulerTool = {
  name: "auto_schedule_feature",
  description:
    "Estimate how many days the feature will take based on current workload.",
  func: async (feature: string) => {
    // Fake logic — integrate with real project calendar later
    if (feature.toLowerCase().includes("about")) {
      return `This feature can be done in 2 days.`;
    }
    return `Based on complexity, estimated time is 5 working days.`;
  },
};
