"use client";

import StreamView from "../components/StreamView";

const creatorId = "abc0fdbd-617c-4c00-a6cd-4eca58ff1f66";

export default function Dashboard() {
  return <StreamView creatorId={creatorId as string} playVideo={true} />;
}
