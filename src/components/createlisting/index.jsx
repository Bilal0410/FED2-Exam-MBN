import { useState } from "react";

function CreateListing() {
  const [listingData, setListingData] = useState({
    title: "",
    description: "",
    tags: "",
    media: "",
    endsAt: new Date().toISOString().split(".")[0],
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    tags: "",
    media: "",
    endsAt: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingData({
      ...listingData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleCreateListing = async () => {
    try {
      const formattedDate = new Date(listingData.endsAt);
      const currentDate = new Date();

      if (
        formattedDate < currentDate ||
        formattedDate > currentDate.setFullYear(currentDate.getFullYear() + 1)
      ) {
        setErrors({
          ...errors,
          endsAt: "Invalid date for 'endsAt'",
        });
        return;
      }

      const mediaURLs = listingData.media.split(",").map((url) => url.trim());
      if (mediaURLs.some((url) => !isValidURL(url))) {
        setErrors({
          ...errors,
          media: "Invalid media URL format",
        });
        return;
      }

      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        console.error("Access token not found in local storage");
        return;
      }

      const response = await fetch(
        "https://api.noroff.dev/api/v1/auction/listings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: listingData.title,
            description: listingData.description,
            tags: listingData.tags.split(",").map((tag) => tag.trim()),
            media: mediaURLs,
            endsAt: formattedDate.toISOString().split(".")[0],
            created: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Listing created successfully!");

        setListingData({
          title: "",
          description: "",
          tags: "",
          media: "",
          endsAt: new Date().toISOString().split(".")[0],
        });
      } else {
        const errorData = await response.json();
        console.error(
          "Error creating listing:",
          response.status,
          response.statusText,
          errorData
        );
      }
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  function isValidURL(url) {
    const urlPattern = new RegExp(
      /^(https?:\/\/)?((www\.)?[\w-]+(\.[a-z]{2,})+|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d{2,5})?(\/\S*)?$/i
    );
    return urlPattern.test(url.trim());
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black text-center">
        Create New Listing
      </h1>
      <form>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-600"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={listingData.title}
            onChange={handleInputChange}
            className="bg-white text-black mt-1 p-2 w-full border rounded-md"
            required
          />
          {errors.title && <div className="text-red-500">{errors.title}</div>}
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-600"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={listingData.description}
            onChange={handleInputChange}
            className="bg-white text-black mt-1 p-2 w-full border rounded-md"
            rows="4"
          />
          {errors.description && (
            <div className="text-red-500">{errors.description}</div>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-600"
          >
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={listingData.tags}
            onChange={handleInputChange}
            className="bg-white text-black mt-1 p-2 w-full border rounded-md"
          />
          {errors.tags && <div className="text-red-500">{errors.tags}</div>}
        </div>

        <div className="mb-4">
          <label
            htmlFor="media"
            className="block text-sm font-medium text-gray-600"
          >
            Media (comma-separated URLs)
          </label>
          <input
            type="text"
            id="media"
            name="media"
            value={listingData.media}
            onChange={handleInputChange}
            className="bg-white text-black mt-1 p-2 w-full border rounded-md"
          />
          {errors.media && <div className="text-red-500">{errors.media}</div>}
        </div>

        <div className="mb-4">
          <label
            htmlFor="endsAt"
            className="block text-sm font-medium text-gray-600"
          >
            Ends At
          </label>
          <input
            type="datetime-local"
            id="endsAt"
            name="endsAt"
            value={listingData.endsAt}
            onChange={handleInputChange}
            className="bg-white text-black mt-1 p-2 w-full border rounded-md"
            required
          />
          {errors.endsAt && <div className="text-red-500">{errors.endsAt}</div>}
        </div>

        {Object.values(errors).some((error) => error !== "") && (
          <div className="text-red-500 mb-4">
            Please fix the errors before submitting the form.
          </div>
        )}

        {successMessage && (
          <div className="text-green-500 mb-4">{successMessage}</div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={handleCreateListing}
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            Create Listing
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateListing;
