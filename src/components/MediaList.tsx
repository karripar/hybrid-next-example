import { fetchAllMedia } from "@/models/mediaModel";
import {fetchTagsByMediaId} from "@/models/tagModel";
import Image from "next/image";
import Link from "next/link";

const MediaList = async () => {
  const mediaList = await fetchAllMedia();
  mediaList.reverse();

  if (!mediaList) {
    return <p>No media found</p>;
  }

  const mediaListWithTags = await Promise.all(mediaList.map(async (media) => {
    const tags = await fetchTagsByMediaId(media.media_id);
    return {...media, tags};
  }));

  return (
    <section className="flex flex-col p-8">
      <ul className="grid grid-cols-3 gap-4">
        {mediaListWithTags.map((item, index) => (
          <li
              key={index}
            className="flex flex-col p-4 bg-gray-100 text-gray-700 rounded-md shadow-md contain"
          >
            <Link href={'/single/'+item.media_id}>
                  <Image
                    src={
                      (item && item.thumbnail) ||
                      (item.screenshots && item.screenshots[0]) ||
                      "/fallback-image.jpg"
                    }
                    alt={item.title}
                    width="300"
                    height="300"
                    className="rounded-md"
                  />
              <h3 className="text-lg font-bold self-start">{item.title}</h3>
              <p>Description: {item.description}</p>
              <p>Date: {new Date(item.created_at).toLocaleDateString("fi-FI")}</p>
              <p>Tags: {item.tags.map((tag) => tag.tag_name).join(', ')}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MediaList;
