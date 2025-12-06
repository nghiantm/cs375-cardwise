// client/src/app/routes.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import AddStatements from "../pages/AddStatements";
import SpendingHistory from "../pages/SpendingHistory";
import MyCards from "../pages/MyCards";
import MyBestCards from "../pages/MyBestCards";
import GlobalRanking from "../pages/GlobalRanking";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/dashboard", element: <Dashboard /> }, // optional, mostly mock
      { path: "/my-cards", element: <MyCards /> },
      { path: "/my-best-cards", element: <MyBestCards /> },
      { path: "/global-ranking", element: <GlobalRanking /> },
      { path: "/add-statements", element: <AddStatements /> },
      { path: "/spending", element: <SpendingHistory /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
