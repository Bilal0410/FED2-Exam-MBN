import { useState, useEffect } from "react";

function ProfilePage() {
  const [listings, setListings] = useState([]);
  const [, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userCredits, setUserCredits] = useState(0);
  const [userAvatar, setUserAvatar] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [avatarChangeSuccess, setAvatarChangeSuccess] = useState(false);

  useEffect(() => {
    // Retrieve user details from local storage
    const storedUserName = localStorage.getItem("user_name");
    const storedUserCredits = localStorage.getItem("user_credits");
    const storedUserAvatar = localStorage.getItem("user_avatar");

    if (storedUserName && storedUserCredits && storedUserAvatar) {
      setUserName(storedUserName);
      setUserCredits(storedUserCredits);
      setUserAvatar(storedUserAvatar);
    }
  }, []);

  useEffect(() => {
    // Retrieve the username from local storage
    const userName = localStorage.getItem("user_name");

    // Ensure that userName is not null or undefined
    if (!userName) {
      console.error("No user name found in local storage.");
      setLoading(false);
      return;
    }

    // Fetch listings for the specific user
    fetch(
      `https://api.noroff.dev/api/v1/auction/profiles/${userName}/listings`,
      {
        headers: {
          // Include your authentication token here
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            console.error("Unauthorized. Please log in.");
          } else {
            console.error(`Request failed with status: ${response.status}`);
          }
          throw new Error("API request failed.");
        }
        return response.json();
      })
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const updateAvatar = (newAvatarUrl) => {
    const apiUrl = `https://api.noroff.dev/api/v1/auction/profiles/${userName}/media`;

    fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        avatar: newAvatarUrl,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error(`Failed to update avatar. Status: ${response.status}`);
          throw new Error("Avatar update failed.");
        }
        return response.json();
      })
      .then((data) => {
        // Update the local state and storage with the new avatar URL
        setUserAvatar(data.avatar);
        localStorage.setItem("user_avatar", data.avatar);

        // Set a success message
        setAvatarChangeSuccess(true);
      })
      .catch((error) => {
        console.error("Error updating avatar:", error);
      });
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewAvatarUrl("");
  };

  const handleChangeAvatar = () => {
    const newAvatar = newAvatarUrl || "https://example.com/default-avatar.jpg";
    updateAvatar(newAvatar);

    closeModal();
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white text-black rounded shadow-md">
      <h1 className="text-2xl font-bold text-center">Profile Page</h1>
      <div className="flex items-center mb-4">
        <img
          src={userAvatar}
          alt="User Avatar"
          className="w-16 h-16 rounded-full mr-4 cursor-pointer"
          onClick={openModal}
        />
        <div>
          <h1 className="text-2xl font-bold text-black">{userName}</h1>
          <p className="text-black">User Credits: {userCredits}</p>
        </div>
      </div>

      {listings.length > 0 ? (
        <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4 py-6 px-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white p-6 rounded-md border-2 border-black"
            >
              <img
                className="mt-4"
                src={listing.media[0]}
                alt={listing.title}
              />
              <a href={`/listings/?id=${listing.id}`}>
                <h1 className="text-2xl font-bold mb-2 text-black overflow-hidden whitespace-nowrap text-overflow-ellipsis">
                  {listing.title}
                </h1>
              </a>
              <p className="text-gray-700 mb-4">{listing.description}</p>
              <p className="text-gray-600">
                Ends at: {new Date(listing.endsAt).toLocaleString()}
              </p>
              <p className="text-gray-600">Bids: {listing._count.bids}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-black">No listings available.</p>
      )}

      {avatarChangeSuccess && (
        <p className="text-green-500 mt-2">Avatar changed successfully!</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:max-w-md">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  {/* Icon or something can be added here */}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    Change Avatar
                  </h3>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      New Avatar URL:
                    </label>
                    <input
                      type="text"
                      value={newAvatarUrl}
                      onChange={(e) => setNewAvatarUrl(e.target.value)}
                      className="mt-1 p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleChangeAvatar}
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-800 transition duration-150 ease-in-out"
                >
                  Change Avatar
                </button>
                <button
                  onClick={closeModal}
                  type="button"
                  className="mt-3 w-full sm:mt-0 sm:w-auto sm:inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 transition duration-150 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
