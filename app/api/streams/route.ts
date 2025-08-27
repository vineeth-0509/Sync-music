import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import youtubesearchapi, { GetVideoDetails } from "youtube-search-api";

// const YT_REGEX =
//   /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
export const CreateStream = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const streams = await prismaClient.stream.findMany({
    where: {
      userId: creatorId ?? "",
    },
  });
  return NextResponse.json({
    streams,
  });
}

// export async function POST(req: NextRequest) {
//   try {
//     const data = CreateStream.parse(await req.json());
//     const isYt = data.url.match(YT_REGEX);
//     const extractedId = data.url.split("?v=")[1] : null;
//     if (!isYt || !extractedId) {
//       return NextResponse.json(
//         {
//           message: "Wrong Url format",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // const res = await youtubesearchapi.GetVideoDetails(extractedId);
//     // console.log(res);
//     const stream = await prismaClient.stream.create({
//       data: {
//         userId: data.creatorId,
//         url: data.url,
//         extractedId,
//         type: "Youtube",
//       },
//     });
//     return NextResponse.json({
//       message: "Added stream",
//       id: stream.id,
//     });
//   } catch (e) {
//     return NextResponse.json(
//       {
//         message: "Something went wrong in creating the streams",
//       },
//       {
//         status: 411,
//       }
//     );
//   }
// }

const YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

export async function POST(req: NextRequest) {
  try {
    const data = CreateStream.parse(await req.json());
    const match = data?.url.match(YT_REGEX);
    const extractedId = match ? match[1] : null;
    if (!match || !extractedId) {
      return NextResponse.json(
        {
          message: "Wrong url format",
        },
        {
          status: 400,
        }
      );
    }
    const res = await GetVideoDetails(extractedId);
    console.log("Youtube API responses:", res);
    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
      },
    });
    return NextResponse.json({
      message: "Added stream",
      id: stream.id,
    });
  } catch (error) {
    console.error("Post stream error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong in creating the streams",
      },
      {
        status: 411,
      }
    );
  }
}
