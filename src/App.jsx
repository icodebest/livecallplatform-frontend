import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Appointments } from "./pages/Appointments";
import { CallDetail } from "./pages/CallDetail";
import { Calls } from "./pages/Calls";
import { CreateCall } from "./pages/CreateCall";
import { Dashboard } from "./pages/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "calls", element: <Calls /> },
      { path: "calls/new", element: <CreateCall /> },
      { path: "calls/:id", element: <CallDetail /> },
      { path: "appointments", element: <Appointments /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
