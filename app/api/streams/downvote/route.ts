import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { UpvoteSchema } from "../upvote/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  if (!user) {
    return NextResponse.json({
      message: "Your is not authenticated!!",
    });
  }

  try {
    const data = UpvoteSchema.safeParse(req.json());
    await prismaClient.upvote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId: data.data?.streamId ?? "",
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error in DownVoting!!",
    });
  }
}
