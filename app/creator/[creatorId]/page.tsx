import StreamView from "@/app/components/StreamView";
export default function Component({
  params: { creatorId },
}: {
  params: { creatorId: string };
}) {
  return <StreamView creatorId={creatorId as string} playVideo={false} />;
}
