// const creatorId = "abc0fdbd-617c-4c00-a6cd-4eca58ff1f66";

import { getServerSession } from "next-auth";
import { prismaClient } from "../lib/db";
import StreamView from "../components/StreamView";

export default async function Dashboard() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return <p>Please log in to access the dashboard</p>;
  }
  const user = await prismaClient.user.findUnique({
    where: {
      email: session?.user?.email,
    },
  });
  if (!user) {
    return <p>user not found</p>;
  }
  const creatorId = user.id;

  return <StreamView creatorId={creatorId as string} playVideo={true} />;
}
