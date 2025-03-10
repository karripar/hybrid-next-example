import { fetchAllMedia } from '@/models/mediaModel';
import Image from 'next/image';

const MediaList = async () => {
  const mediaList = await fetchAllMedia();
  mediaList.reverse();

  if (!mediaList) {
    return <p>No media found</p>;
  }

  return (
    <section className="flex flex-col p-8">
      <ul className="grid grid-cols-3 gap-4">
        {mediaList.map((item, index) => (
          <li
            key={index}
            className="flex flex-col text-gray-700 items-center border border-gray-300 p-4 shadow-lg rounded-md bg-white"
          >
            {item.media_type.includes('video') ? (
              <video
                controls
                width="320"
                height="200"
                className="rounded-md"
              >
                <source src={item.filename} type={item.media_type || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            ) : (
              item.thumbnail && (
                <Image
                  src={item && item.thumbnail || (item.screenshots && item.screenshots[0]) || '/fallback-image.jpg'}
                  alt={item.title}
                  width={320}
                  height={200}
                  className="rounded-md"
                />
              )
            )}
            <h3 className="text-lg font-bold self-start">{item.title}</h3>
            <p>Description: {item.description}</p>
            <p>Date: {new Date(item.created_at).toLocaleDateString('fi-FI')}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MediaList;
