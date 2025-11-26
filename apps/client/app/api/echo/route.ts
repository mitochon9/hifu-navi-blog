import { z } from "zod";
import { validateJsonRequest } from "@/shared/lib/request-validation";

const EchoRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  timestamp: z.string().optional(),
});

export async function POST(request: Request) {
  const validation = await validateJsonRequest(EchoRequestSchema, request);
  if (!validation.success) {
    return Response.json({ errors: validation.errors }, { status: 400 });
  }

  const { message, timestamp } = validation.data;
  return Response.json({
    echo: message,
    receivedAt: timestamp ?? new Date().toISOString(),
    serverTime: new Date().toISOString(),
  });
}
