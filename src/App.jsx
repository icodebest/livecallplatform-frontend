import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";
import { Appointments } from "./pages/Appointments";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Signup } from "./pages/Signup";
import { VerifyEmail } from "./pages/VerifyEmail";
import { VoiceSessionRoom } from "./pages/VoiceSessionRoom";
import { SessionHistory } from "./pages/SessionHistory";
import { CreateSession } from "./pages/CreateSession";
import { Dashboard } from "./pages/Dashboard";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/signup", element: <Signup /> },
  { path: "/verify", element: <VerifyEmail /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "sessions", element: <SessionHistory /> },
          { path: "sessions/new", element: <CreateSession /> },
          { path: "sessions/:id", element: <VoiceSessionRoom /> },
          { path: "appointments", element: <Appointments /> }
        ]
      }
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
