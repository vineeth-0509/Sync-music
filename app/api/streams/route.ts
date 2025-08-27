import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const CreateStream = z.object({
  creatorId: z.string(),
  url: z
    .url()
    .refine((val) => val.includes("youtube") || val.includes("spotify"), {
      message: "URL must be from youtube or spotify.",
    }),
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStream.parse(await req.json());
    prismaClient.stream.create({
        userId: data.creatorId
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error while adding a stream",
      },
      {
        status: 411,
      }
    );
  }
}
