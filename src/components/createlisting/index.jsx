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
    // Clear the error message when the user starts typing again
    setErrors({
      ...errors,
      [name]: "",
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
        setErrors({
          ...errors,
          endsAt: "Invalid date for 'endsAt'",
        });
        return;
      }

      // Validate media URLs
      const mediaURLs = listingData.media.split(",").map((url) => url.trim());
      if (mediaURLs.some((url) => !isValidURL(url))) {
        setErrors({
          ...errors,
          media: "Invalid media URL format",
        });
        return;
      }

      // Other validation code...

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
            Authorization: `Bearer ${accessToken}`, // Include the access token
          },
          body: JSON.stringify({
            title: listingData.title,
            description: listingData.description,
            tags: listingData.tags.split(",").map((tag) => tag.trim()), // Convert tags to array
            media: mediaURLs, // Use validated media URLs
            endsAt: formattedDate.toISOString().split(".")[0], // Use the formatted date without milliseconds
            created: new Date().toISOString(), // Set the created field to the current date
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Listing created successfully!");
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

  // Helper function to check if a URL is valid
  function isValidURL(url) {
    const urlPattern = new RegExp(
      /^(https?:\/\/)?((www\.)?[\w-]+(\.[a-z]{2,})+|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d{2,5})?(\/\S*)?$/i
    );
    return urlPattern.test(url.trim());
  }

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

        {/* Display error messages */}
        {Object.values(errors).some((error) => error !== "") && (
          <div className="text-red-500 mb-4">
            Please fix the errors before submitting the form.
          </div>
        )}

        {/* Display success message */}
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
