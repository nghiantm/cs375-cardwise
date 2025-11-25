import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import AddStatements from "../pages/AddStatements";
import SpendingHistory from "../pages/SpendingHistory";


const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/dashboard", element: <Dashboard /> }, 
      { path: "/add-statements", element: <AddStatements /> },
      { path: "/spending", element: <SpendingHistory /> },

    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
