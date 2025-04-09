import { NextRequest, NextResponse } from "next/server";
import { runBAAgent } from "@/agent/baAgent"; // use the correct path if it's different

export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI API key is available (don't log the full key for security)
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    // Removed unused apiKeyPrefix variable
    
    const body = await req.json();
    const { feature, repo } = body;
    
    console.log(`[API] Processing request for feature: ${feature}, repo: ${repo}, API key available: ${hasApiKey}`);

    const result = await runBAAgent({ feature, repo });

    console.log('[API] Successfully generated result');
    
    // Return the raw text result without additional JSON wrapping
    return new NextResponse(result, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
