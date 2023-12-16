import { Router, Route, RootRoute } from "@tanstack/react-router";
import Root from "./App";
import AllListings from "./components/listings";
import LoginForm from "./components/login";
import RegisterForm from "./components/register";
import CreateListing from "./components/createlisting";

const rootRoute = new RootRoute({
  component: Root,
});

// NOTE: @see https://tanstack.com/router/v1/docs/guide/routes

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: AllListings,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginForm,
});

const registerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterForm,
});

const listingRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/createlisting",
  component: CreateListing,
});


const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  listingRoute
]);

export const router = new Router({ routeTree });

export default router;