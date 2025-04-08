export const githubTool = {
  name: "check_github_code",
  description: "Check GitHub repo for code impact, file count, and structure.",
  func: async (input: string) => {
    // Simulated logic - replace with real GitHub API call if needed
    return `Checked repo "${input}". Found 2 frontend and 3 backend files related.`;
  },
};
