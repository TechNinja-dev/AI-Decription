import { useEffect, useState } from "react";
import API_URL from "../config/api";

export default function MyStuffPage({ userId }) {
  const [groupedImages, setGroupedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------- Delete Image --------
  const handleDelete = async (imageId) => {
    if (!userId) {
      setError("You must be logged in to delete images.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/images/${imageId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || "Failed to delete image");
      }

      setGroupedImages((prev) => {
        const updated = { ...prev };
        for (const date in updated) {
          updated[date] = updated[date].filter(
            (img) => img._id !== imageId
          );
          if (updated[date].length === 0) {
            delete updated[date];
          }
        }
        return updated;
      });
    } catch (err) {
      setError(err.message || "Error deleting image");
    }
  };

  // -------- Fetch Images --------
  useEffect(() => {
    if (!userId) return;

    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/images?user_id=${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }

        const images = await response.json();

        const grouped = images.reduce((acc, image) => {
          const date = image.uploaded_at.split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(image);
          return acc;
        }, {});

        setGroupedImages(grouped);
      } catch (err) {
        setError("Failed to load images. Is the server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [userId]);

  // -------- UI --------
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          My Gallery
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your AI-generated images, organized by date.
        </p>
      </div>

      {loading && (
        <p className="text-center text-gray-500">
          Loading your images...
        </p>
      )}

      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && Object.keys(groupedImages).length === 0 && (
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-gray-500">
            You haven't generated any images yet.
          </p>
        </div>
      )}

      <div className="space-y-12">
        {Object.keys(groupedImages)
          .sort((a, b) => new Date(b) - new Date(a))
          .map((date) => (
            <div key={date}>
              <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupedImages[date].map((image) => (
                  <div
                    key={image._id}
                    className="bg-white rounded shadow overflow-hidden group"
                  >
                    <img
                      src={`data:${image.content_type};base64,${image.image_data}`}
                      alt={image.filename}
                      className="w-full h-56 object-cover group-hover:opacity-75 transition"
                    />

                    <div className="p-4 flex justify-between items-center">
                      <p className="text-sm text-gray-600 truncate">
                        {image.filename}
                      </p>

                      <button
                        onClick={() => handleDelete(image._id)}
                        className="text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
