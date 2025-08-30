import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//import youtubesearchapi, { GetVideoDetails } from "youtube-search-api";
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";
import { google } from "googleapis";


// async function fetchYoutubeVideo(videoId: string) {
//   const youtube = google.youtube({
//     version: "v3",
//     auth: process.env.YT_API_KEY, // your API key in .env
//   });

//   const response = await youtube.videos.list({
//     part: ["snippet", "contentDetails"],
//     id: [videoId],
//   });

//   const video = response.data.items?.[0];

//   if (!video || !video.snippet) return null;

//   const thumbnails = video.snippet.thumbnails
//     ? Object.values(video.snippet.thumbnails)
//     : [];

//   return {
//     title: video.snippet.title,
//     thumbnails,
//   };
// }


export const CreateStream = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) {
    return NextResponse.json({ message: "Error" }, { status: 411 });
  }
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  if (!user) {
    return NextResponse.json({ message: "Error" }, { status: 411 });
  }
  const [streams, activeStream] = await Promise.all([
    await prismaClient.stream.findMany({
      where: { userId: creatorId, played: false },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: user.id,
          },
        },
      },
    }),
    prismaClient.currentStream.findFirst({
      where: {
        userId: creatorId,
      },
      include: {
        stream: true,
      },
    }),
  ]);
  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
  });
}

// export async function POST(req: NextRequest) {
//   try {
//     const data = CreateStream.parse(await req.json());
//     const session = await getServerSession();
//     if (!session?.user?.email) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }
//     const user = await prismaClient.user.findUnique({
//       where: { email: session?.user?.email },
//     });

//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 401 });
//     }
//     const match = data?.url.match(YT_REGEX);
//     const extractedId = match ? match[1] : null;
//     if (!match || !extractedId) {
//       return NextResponse.json(
//         {
//           message: "Wrong url format",
//         },
//         {
//           status: 400,
//         }
//       );
//     }
//     const res = await GetVideoDetails(extractedId);
//     if (!res?.title || !res?.thumbnail?.thumbnails?.length) {
//       return NextResponse.json(
//         { message: "Video details not found" },
//         { status: 404 }
//       );
//     }
//     console.log(res.title);
//     const thumbnails = res.thumbnail.thumbnails;
//     thumbnails.sort((a: { width: number }, b: { width: number }) =>
//       a.width < b.width ? -1 : 1
//     );
//     const stream = await prismaClient.stream.create({
//       data: {
//         userId: user.id,
//         url: data.url,
//         extractedId,
//         type: "Youtube",
//         title: res.title ?? "Cant find Video",
//         smallImg:
//           (thumbnails.length > 1
//             ? thumbnails[thumbnails.length - 2].url
//             : thumbnails[thumbnails.length - 1].url) ??
//           "https://sp.yimg.com/ib/th/id/OIP.uLKVfx86K6NvFYSBw47ikAHaEK?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
//         bigImg:
//           thumbnails[thumbnails.length - 1].url ??
//           "https://sp.yimg.com/ib/th/id/OIP.uLKVfx86K6NvFYSBw47ikAHaEK?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
//       },
//     });
//     return NextResponse.json({
//       ...stream,
//       hasUpvoted: false,
//       upvotes: 0,
//     });
//   } catch (error) {
//     console.error("Post stream error:", error);
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

// async function fetchYoutubeVideo(videoId: string){
//   const apiKey = process.env.YT_API_KEY;
//   if(!apiKey) throw new Error("Youtube API key not set");
//   const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
//   const res = await fetch(url);
//   const data = await res.json();
//   if(!data.items || data.items.length === 0){
//     throw new Error("Video not found");
//   }
//   const snippet = data.items[0].snippet;
//   return{
//     title: snippet.title,
//     thumbnails: snippet.thumbnails
//   };
// }

// export async function POST(req: NextRequest){
//   try {
//     const data = CreateStream.parse(await req.json());
//     const session = await getServerSession();
//     if(!session?.user?.email){
//       return NextResponse.json({message:"Unauthorized"},{status: 401});
//     }
//     const user = await prismaClient.user.findUnique({
//       where:{
//         email: session?.user?.email
//       }
//     });
//     if(!user){
//       return NextResponse.json({message:"User not found"},{status: 401});
//     }
//     const match = data.url.match(YT_REGEX);
//     const extractedId = match ? match[1] : null;
//     if(!match || !extractedId){
//       return NextResponse.json({
//         message:"Wrong URL format"
//       },{
//         status: 400
//       });
//     }
//     let videoDetails;
//     try {
//       videoDetails = await fetchYoutubeVideo(extractedId);
//     } catch (error) {
//       return NextResponse.json({
//         message:"video details not found"
//       },{
//         status: 404
//       });
//     }
//     const thumbnailsArray = Object.values(videoDetails.thumbnails);
//     thumbnailsArray.sort((a: any, b: any) => (a.width < b.width ? -1 : 1));

//     // Create stream in DB
//     const stream = await prismaClient.stream.create({
//       data: {
//         userId: user.id,
//         url: data.url,
//         extractedId,
//         type: "Youtube",
//         title: videoDetails.title ?? "Cant find Video",
//         smallImg:
//           (thumbnailsArray.length > 1
//             ? thumbnailsArray[thumbnailsArray.length - 2].url
//             : thumbnailsArray[thumbnailsArray.length - 1].url) ??
//           "https://sp.yimg.com/ib/th/id/OIP.uLKVfx86K6NvFYSBw47ikAHaEK?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
//         bigImg:
//           thumbnailsArray[thumbnailsArray.length - 1].url ??
//           "https://sp.yimg.com/ib/th/id/OIP.uLKVfx86K6NvFYSBw47ikAHaEK?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
//       },
//     });

//     return NextResponse.json({ ...stream, hasUpvoted: false, upvotes: 0 });
//   } catch (error) {
//     console.error("Post stream error:", error);
//     return NextResponse.json(
//       { message: "Something went wrong in creating the streams" },
//       { status: 500 }
//     );
//   }
//   }
// Type-safe VideoDetails
type VideoDetails = {
  title: string | null;
  thumbnails: Record<string, { url: string; width?: number; height?: number }>;
};

async function fetchYoutubeVideo(videoId: string): Promise<VideoDetails | null> {
  const youtube = google.youtube({
    version: "v3",
    auth: process.env.YT_API_KEY,
  });

  const response = await youtube.videos.list({
    part: ["snippet"],
    id: [videoId],
  });

  const video = response.data.items?.[0];
  if (!video?.snippet) return null;

  
  const title = video.snippet.title ?? null;

  // const thumbnails: Record<string, { url: string; width?: number; height?: number }> =
  //   video.snippet.thumbnails ?? {};
  const thumbnails = video.snippet.thumbnails as unknown as Record<
    string,
    { url: string; width?: number; height?: number }
  >;

  return { title, thumbnails };
}


export async function POST(req: NextRequest) {
  try {
    const data = CreateStream.parse(await req.json());
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const match = data.url.match(YT_REGEX);
    const extractedId = match ? match[1] : null;
    if (!match || !extractedId) {
      return NextResponse.json({ message: "Wrong URL format" }, { status: 400 });
    }

    // Fetch video details from YouTube API
    let videoDetails: VideoDetails | null = null;
    try {
      videoDetails = await fetchYoutubeVideo(extractedId);
      if (!videoDetails) throw new Error("Video not found");
    } catch (err) {
      return NextResponse.json({ message: "Video details not found" }, { status: 404 });
    }

    const thumbnailsArray = Object.values(videoDetails.thumbnails ?? []);
    thumbnailsArray.sort((a: any, b: any) => (a.width < b.width ? -1 : 1));

    const stream = await prismaClient.stream.create({
      data: {
        userId: user.id,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: videoDetails.title ?? "Cannot find video",
        smallImg:
          (thumbnailsArray.length > 1
            ? thumbnailsArray[thumbnailsArray.length - 2].url
            : thumbnailsArray[thumbnailsArray.length - 1]?.url) ??
          "https://sp.yimg.com/ib/th/id/OIP.uLKVfx86K6NvFYSBw47ikAHaEK?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
        bigImg:
          thumbnailsArray[thumbnailsArray.length - 1]?.url ??
          "https://sp.yimg.com/ib/th/id/OIP.uLKVfx86K6NvFYSBw47ikAHaEK?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
      },
    });

    return NextResponse.json({ ...stream, hasUpvoted: false, upvotes: 0 });
  } catch (error) {
    console.error("Post stream error:", error);
    return NextResponse.json(
      { message: "Something went wrong in creating the streams" },
      { status: 500 }
    );
  }
}
