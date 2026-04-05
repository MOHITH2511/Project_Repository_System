import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { ContributorDashboard } from "./pages/ContributorDashboard";
import { ReviewerDashboard } from "./pages/ReviewerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CreateProject } from "./pages/CreateProject";
import { EditProject } from "./pages/EditProject";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ReviewProject } from "./pages/ReviewProject";
import { Repository } from "./pages/Repository";
import { AppLayout } from "./components/AppLayout";
import { RequireAuth, RequireRole, RedirectIfAuthenticated, RoleLanding } from "./components/RouteGuards";
import { Signup } from "./pages/Signup";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RedirectIfAuthenticated>
        <Login />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: "/signup",
    element: (
      <RedirectIfAuthenticated>
        <Signup />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <RoleLanding />,
      },
      {
        path: "contributor",
        element: (
          <RequireRole allowedRoles={["CONTRIBUTOR", "ADMIN"]}>
            <ContributorDashboard />
          </RequireRole>
        ),
      },
      {
        path: "reviewer",
        element: (
          <RequireRole allowedRoles={["REVIEWER", "ADMIN"]}>
            <ReviewerDashboard />
          </RequireRole>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireRole allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RequireRole>
        ),
      },
      {
        path: "project/create",
        element: (
          <RequireRole allowedRoles={["CONTRIBUTOR", "ADMIN"]}>
            <CreateProject />
          </RequireRole>
        ),
      },
      {
        path: "project/:id/edit",
        element: (
          <RequireRole allowedRoles={["CONTRIBUTOR", "ADMIN"]}>
            <EditProject />
          </RequireRole>
        ),
      },
      {
        path: "project/:id",
        element: <ProjectDetail />,
      },
      {
        path: "review/:id",
        element: (
          <RequireRole allowedRoles={["REVIEWER", "ADMIN"]}>
            <ReviewProject />
          </RequireRole>
        ),
      },
      {
        path: "repository",
        element: <Repository />,
      },
    ],
  },
]);