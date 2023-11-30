import { Router, Route, RootRoute } from "@tanstack/react-router";
import Root from "./App";
import LoginForm from "./components/login";

const rootRoute = new RootRoute({
  component: Root,
});

// NOTE: @see https://tanstack.com/router/v1/docs/guide/routes

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginForm,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginForm,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
]);

export const router = new Router({ routeTree });

export default router;