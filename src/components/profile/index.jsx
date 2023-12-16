import { useState } from "react";

function ProfilePage() {
  // Retrieve values from local storage
  const userCredits = localStorage.getItem("user_credits");
  const storedUserName = localStorage.getItem("user_name");
  const storedUserAvatar = localStorage.getItem("user_avatar");

  // State variables for user information
  const [userName, setUserName] = useState(storedUserName);
  const [userAvatar, setUserAvatar] = useState(storedUserAvatar);

  // State variables for modal and change avatar functionality
  const [isModalOpen, setModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [avatarChangeSuccess, setAvatarChangeSuccess] = useState(false);

  // Function to open the modal
  const openModal = () => {
    setModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalOpen(false);
    // Clear the newAvatarUrl when closing the modal
    setNewAvatarUrl("");
  };

  // Function to handle avatar change
  const handleChangeAvatar = () => {
    // Perform any necessary logic to change the avatar URL
    // For demonstration purposes, let's update the avatar URL with a new value
    const newAvatar = newAvatarUrl || "https://example.com/default-avatar.jpg";

    // Update the state and local storage
    setUserAvatar(newAvatar);
    localStorage.setItem("user_avatar", newAvatar);

    // Display success message
    setAvatarChangeSuccess(true);

    // Close the modal after changing the avatar
    closeModal();
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow-md">
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

      {avatarChangeSuccess && (
        <p className="text-green-500 mt-2">Avatar changed successfully!</p>
      )}

      {/* Modal for changing avatar */}
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
