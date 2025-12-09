// client/src/app/routes.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Onboarding from "../pages/Onboarding";
import Dashboard from "../pages/Dashboard";
import AddStatements from "../pages/AddStatements";
import Spending from "../pages/Spending";
import MyCards from "../pages/MyCards";
import MyBestCards from "../pages/MyBestCards";
import GlobalRanking from "../pages/GlobalRanking";
import PersonalRanking from "../pages/PersonalRanking";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/global-ranking", element: <GlobalRanking /> },
      { 
        path: "/onboarding", 
        element: <ProtectedRoute><Onboarding /></ProtectedRoute> 
      },
      { 
        path: "/dashboard", 
        element: <ProtectedRoute><Dashboard /></ProtectedRoute> 
      },
      { 
        path: "/my-cards", 
        element: <ProtectedRoute><MyCards /></ProtectedRoute> 
      },
      { 
        path: "/my-best-cards", 
        element: <ProtectedRoute><MyBestCards /></ProtectedRoute> 
      },
      { 
        path: "/personal-ranking", 
        element: <ProtectedRoute><PersonalRanking /></ProtectedRoute> 
      },
      { 
        path: "/add-statements", 
        element: <ProtectedRoute><AddStatements /></ProtectedRoute> 
      },
      { 
        path: "/spending", 
        element: <ProtectedRoute><Spending /></ProtectedRoute> 
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
