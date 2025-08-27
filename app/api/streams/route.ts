import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const YT_REGEX = new RegExp("^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$")

export const CreateStream = z.object({
  creatorId: z.string(),
  url: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStream.parse(await req.json());
    const isYt = YT_REGEX.test(data.url);
    if(!isYt){
      return NextResponse.json(
      {
        message: "Wrong Url format",
      },
      {
        status: 411,
      }
    );
    }
    const extractedId = data.split("?v=")[1];
    prismaClient.stream.create({
      data:{
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type:
      }
        
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
