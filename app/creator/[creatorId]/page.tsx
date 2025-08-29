import StreamView from "@/app/components/StreamView";
const creatorId = "6b71740c-ebc7-4ba8-9036-c091f14fea39";
export default function Component({
  params: { creatorId },
}: {
  params: { creatorId: string };
}) {
  return <StreamView creatorId={creatorId as string} />;
}
