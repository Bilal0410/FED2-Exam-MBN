// import { API_URL } from "./constants";

export const registerUser = async (userData) => {
    // If the avatar is not provided, remove it from request body
    if (!userData.avatar) {
      delete userData.avatar;
    }
};

