import { fetchMediaById } from "@/models/mediaModel";
import Image from "next/image";

type SingleProps = {
  params: Promise<{ id: string }>;
};

export default async function Single({ params }: SingleProps) {
  const { id } = await params;
  const mediaItem = await fetchMediaById(Number(id));
  return (
    <div>
      {mediaItem.media_type.includes("video") ? (
        <video
          controls
          width="500"
          height="400"
          className="rounded-md"
          src={mediaItem.filename}
        />
      ) : (
        mediaItem.thumbnail && (
          <Image
            src={
              (mediaItem && mediaItem.thumbnail) ||
              (mediaItem.screenshots && mediaItem.screenshots[0]) ||
              "/fallback-image.jpg"
            }
            alt={mediaItem.title}
            width={500}
            height={350}
            className="rounded-md"
          />
        )
      )}
    </div>
  );
}
