import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [data, setData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const navigateToHome = () => {
    setTimeout(() => {
      navigate({ to: "/" });
    }, 2000);
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();

    const { email, password } = event.target.elements;

    const payload = {
      email: email.value,
      password: password.value,
    };

    try {
      const res = await fetch(
        "https://api.noroff.dev/api/v1/auction/auth/login",
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError({ password: "Invalid Password" });
        } else if (data.message === "Username not found") {
          setError({ email: "Username doesn't exist." });
        } else if (data.message === "Invalid password") {
          setError({ password: "Wrong password." });
        } else {
          setError({ general: "An unexpected error occurred." });
        }
        return;
      }

      if (typeof data.accessToken === "undefined") {
        setError({ message: "Access token is not provided." });
        return;
      }

      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_avatar", data.avatar);
      localStorage.setItem("user_credits", data.credits);

      setData(data);
      setIsSuccess(res.ok);
      navigateToHome();
    } catch (error) {
      console.warn("An error occurred", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error.general) return <div>An error occurred: {error.general}</div>;

  return (
    <div className="flex flex-col justify-center flex-1 min-h-full px-6 py-12 bg-custom lg:px-8 card w-full max-w-[100%] h-[300px] md:h-auto  glass">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-md shadow-md border-2">
        <img className="w-auto h-10 mx-auto" src="" alt="" />
        <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-center text-black">
          Sign in to your account
        </h2>

        {isSuccess ? (
          <section>
            <p className="text-center text-green-600">
              👋 Hi {data?.name}. You will now redirect to the home page!
            </p>
          </section>
        ) : (
          <form className="space-y-6" onSubmit={handleOnSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-black"
              >
                Email address
              </label>

              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue="first.last@stud.noroff.no"
                  className="px-1 block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white"
                />
              </div>
              {error.email && <div className="text-red-500">{error.email}</div>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Password
                </label>
              </div>

              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  defaultValue="UzI1NiIsInR5cCI"
                  className="block w-full rounded-md border-0 px-1 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white"
                />
              </div>
              {error.password && (
                <div className="text-red-500">{error.password}</div>
              )}
            </div>

            <div>
              <button
                disabled={isLoading}
                type="submit"
                className="flex w-full justify-center rounded-md bg-custom-aqua px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm bg-blue-900 p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isLoading ? "signing in" : "Sign in"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-10 text-sm text-center text-gray-500">
          Not a member?{" "}
          <a
            href="/register"
            className="font-semibold leading-6 text-custom-aqua hover:text-bg-blue-900"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
