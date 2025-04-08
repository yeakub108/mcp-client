import { runBAAgent } from "@/agent/baAgent";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { feature, repo } = req.body;
    try {
      const result = await runBAAgent({ feature, repo });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to process the request." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
