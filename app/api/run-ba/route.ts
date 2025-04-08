import { NextRequest, NextResponse } from "next/server";
import { runBAAgent } from "@/agent/baAgent"; // use the correct path if it's different

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feature, repo } = body;

    const result = await runBAAgent({ feature, repo });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
