import { useState } from "react";

function CreateListing() {
  const [listingData, setListingData] = useState({
    title: "",
    description: "",
    tags: "",
    media: "",
    endsAt: new Date().toISOString().split(".")[0],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingData({
      ...listingData,
      [name]: value,
    });
  };

  const handleCreateListing = async () => {
    try {
      const formattedDate = new Date(listingData.endsAt);
      const currentDate = new Date();

      // Validate endsAt
      if (
        formattedDate < currentDate ||
        formattedDate > currentDate.setFullYear(currentDate.getFullYear() + 1)
      ) {
        console.error("Invalid date for 'endsAt'");
        return;
      }

      const isoFormattedDate = formattedDate.toISOString().split(".")[0];

      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        console.error("Access token not found in local storage");
        return;
      }

      // Validate media URLs
      const mediaURLs = listingData.media.split(",").map((url) => url.trim());
      if (mediaURLs.some((url) => !isValidURL(url))) {
        console.error("Invalid media URL format");
        return;
      }

      // eslint-disable-next-line no-inner-declarations
      function isValidURL(url) {
        const urlPattern = new RegExp(
          /^(https?:\/\/)?((www\.)?[\w-]+(\.[a-z]{2,})+|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d{2,5})?(\/\S*)?$/i
        );
        return urlPattern.test(url.trim());
      }

      const response = await fetch(
        "https://api.noroff.dev/api/v1/auction/listings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the access token
          },
          body: JSON.stringify({
            title: listingData.title,
            description: listingData.description,
            tags: listingData.tags.split(",").map((tag) => tag.trim()), // Convert tags to array
            media: mediaURLs, // Use validated media URLs
            endsAt: isoFormattedDate, // Use the formatted date without milliseconds
            created: new Date().toISOString(), // Set the created field to the current date
          }),
        }
      );

      if (response.ok) {
        console.log("Listing created successfully!");
        // Reset the form or redirect the user after successful creation
        setListingData({
          title: "",
          description: "",
          tags: "",
          media: "",
          endsAt: new Date().toISOString().split(".")[0], // Remove milliseconds for the default value
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Listing</h1>
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
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={handleCreateListing}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Create Listing
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateListing;
