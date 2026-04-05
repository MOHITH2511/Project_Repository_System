import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { departments } from "../constants/options";
import {
  Users,
  FolderKanban,
  HardDrive,
  TrendingUp,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  UserPlus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { listProjects } from "../api/projectApi";
import { getUserProjectCounts, listUsers, updateUserActive, updateUserRole } from "../api/userApi";
import { getAdminMetrics } from "../api/adminApi";
import { register } from "../api/authApi";
import type { AdminMetrics, AuthUser, BackendProject, UserRole } from "../api/types";
import { ApiError } from "../api/client";

function formatRole(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatStorage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function AdminDashboard() {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [userProjectCounts, setUserProjectCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [pendingRole, setPendingRole] = useState<UserRole>("CONTRIBUTOR");
  const [pendingActive, setPendingActive] = useState<boolean>(true);

  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addDepartment, setAddDepartment] = useState("");
  const [addRole, setAddRole] = useState<UserRole>("CONTRIBUTOR");

  const [isMutating, setIsMutating] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [projectPage, usersResponse, metricsResponse] = await Promise.all([
        listProjects(undefined, 0, 500),
        listUsers(),
        getAdminMetrics(),
      ]);

      setProjects(projectPage.content);
      setUsers(usersResponse);
      setMetrics(metricsResponse);

      const userIds = usersResponse.map((user) => user.id);
      if (userIds.length > 0) {
        const counts = await getUserProjectCounts(userIds);
        setUserProjectCounts(counts);
      } else {
        setUserProjectCounts({});
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load admin dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  const totalProjects = projects.length;
  const totalUsers = users.length;
  const activeProjects = projects.filter((p) => {
    const status = p.status.toUpperCase();
    return status !== "ARCHIVED" && status !== "REJECTED";
  }).length;

  const projectsByDepartment = useMemo(
    () =>
      departments
        .map((dept) => ({
          department: dept,
          count: projects.filter((p) => p.department === dept).length,
        }))
        .sort((a, b) => b.count - a.count),
    [projects]
  );

  const projectsByStatus = useMemo(
    () => [
      { status: "Draft", count: projects.filter((p) => p.status.toUpperCase() === "DRAFT").length },
      { status: "Submitted", count: projects.filter((p) => p.status.toUpperCase() === "SUBMITTED").length },
      { status: "Under Review", count: projects.filter((p) => p.status.toUpperCase() === "UNDER_REVIEW").length },
      { status: "Approved", count: projects.filter((p) => p.status.toUpperCase() === "APPROVED").length },
      { status: "Rejected", count: projects.filter((p) => p.status.toUpperCase() === "REJECTED").length },
      { status: "Archived", count: projects.filter((p) => p.status.toUpperCase() === "ARCHIVED").length },
    ],
    [projects]
  );

  const activeUsers = users.filter((user) => user.active).length;

  const resetAddUserForm = () => {
    setAddName("");
    setAddEmail("");
    setAddPassword("");
    setAddDepartment("");
    setAddRole("CONTRIBUTOR");
  };

  const handleCreateUser = async () => {
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim() || !addDepartment) {
      setError("Name, email, department and password are required");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await register({
        name: addName.trim(),
        email: addEmail.trim(),
        password: addPassword,
        role: addRole,
        department: addDepartment,
      });

      setIsAddUserDialogOpen(false);
      resetAddUserForm();
      await loadDashboard();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create user");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const openRoleDialog = (user: AuthUser) => {
    setSelectedUser(user);
    setPendingRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    setIsMutating(true);
    setError(null);

    try {
      await updateUserRole(selectedUser.id, pendingRole);
      setIsRoleDialogOpen(false);
      await loadDashboard();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update user role");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const openToggleActiveDialog = (user: AuthUser) => {
    setSelectedUser(user);
    setPendingActive(!user.active);
    setIsConfirmDialogOpen(true);
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;

    setIsMutating(true);
    setError(null);

    try {
      await updateUserActive(selectedUser.id, pendingActive);
      setIsConfirmDialogOpen(false);
      await loadDashboard();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update user status");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const openUserDetails = (user: AuthUser) => {
    setSelectedUser(user);
    setIsUserDetailsDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Administrator Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and user management</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-3xl">{totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-blue-600">
              <FolderKanban className="w-4 h-4 mr-2" />
              {activeProjects} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <Users className="w-4 h-4 mr-2" />
              {activeUsers} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Storage Used</CardDescription>
            <CardTitle className="text-3xl">{formatStorage(metrics?.storageUsedBytes ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <HardDrive className="w-4 h-4 mr-2" />
              {metrics?.totalDocuments ?? 0} files stored
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl">+{metrics?.projectsCreatedThisMonth ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              New projects created
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Department</CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectsByDepartment.map((item) => (
                <div key={item.department}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.department}</span>
                    <span className="text-sm text-gray-600">{item.count} projects</span>
                  </div>
                  <Progress value={totalProjects > 0 ? (item.count / totalProjects) * 100 : 0} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Current lifecycle distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{item.status}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
          <CardDescription>Repository storage usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Used Storage</span>
              <span className="text-sm text-gray-600">{formatStorage(metrics?.storageUsedBytes ?? 0)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Calculated from uploaded document files on the server.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setIsAddUserDialogOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or role..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {user.role === "REVIEWER" && <Shield className="w-3 h-3" />}
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{userProjectCounts[String(user.id)] ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "default" : "secondary"} className={user.active ? "bg-green-100 text-green-700" : ""}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openUserDetails(user)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className={user.active ? "text-red-600" : "text-green-700"} onClick={() => openToggleActiveDialog(user)}>
                            <UserX className="w-4 h-4 mr-2" />
                            {user.active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user account with role and department.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={addName} onChange={(e) => setAddName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={addDepartment} onValueChange={setAddDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={addRole} onValueChange={(value) => setAddRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={isMutating}>{isMutating ? "Creating..." : "Create User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>Update system role for {selectedUser?.name ?? "selected user"}.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Role</Label>
            <Select value={pendingRole} onValueChange={(value) => setPendingRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                <SelectItem value="REVIEWER">Reviewer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button onClick={handleRoleUpdate} disabled={isMutating}>{isMutating ? "Saving..." : "Save Role"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDetailsDialogOpen} onOpenChange={setIsUserDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Account details and contribution summary.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
              <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
              <p><span className="font-medium">Role:</span> {formatRole(selectedUser.role)}</p>
              <p><span className="font-medium">Department:</span> {selectedUser.department}</p>
              <p><span className="font-medium">Status:</span> {selectedUser.active ? "Active" : "Inactive"}</p>
              <p><span className="font-medium">Projects:</span> {userProjectCounts[String(selectedUser.id)] ?? 0}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsUserDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingActive ? "Activate user?" : "Deactivate user?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingActive
                ? `This will reactivate ${selectedUser?.name ?? "the user"}.`
                : `This will deactivate ${selectedUser?.name ?? "the user"} and block account usage.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive} disabled={isMutating}>
              {isMutating ? "Saving..." : pendingActive ? "Activate" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
