import { NextRequest, NextResponse } from "next/server";
import { runBAAgent } from "@/agent/baAgent"; // use the correct path if it's different

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feature, repo } = body;

    const result = await runBAAgent({ feature, repo });

    // Return the raw text result without additional JSON wrapping
    return new NextResponse(result, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
