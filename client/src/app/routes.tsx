import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
