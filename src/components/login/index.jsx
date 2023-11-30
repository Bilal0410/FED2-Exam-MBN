import { useState } from "react";

export default function LoginForm() {
  // State for storing user credentials
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  // Function to handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // You can add logic here to handle the login process, such as API calls
    console.log("Login submitted with:", credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={handleFormSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="text"
            placeholder="Enter your email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Enter your password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          type="submit"
        >
          Log In
        </button>
        <p className="text-gray-600 text-sm">
          Dont have an account?{" "}
          <a className="text-blue-500 hover:underline" href="/register">
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}
