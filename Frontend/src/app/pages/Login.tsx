import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { FolderKanban } from "lucide-react";
import { login } from "../api/authApi";
import { getCurrentUser, isAuthenticated, setCurrentUser, setToken } from "../api/session";
import { ApiError } from "../api/client";
import { roleDefaultPath } from "../components/RouteGuards";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(roleDefaultPath(getCurrentUser()?.role));
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const auth = await login({ email: email.trim(), password });
      setToken(auth.token);
      setCurrentUser(auth.user);

      if (auth.user.role === "REVIEWER") {
        navigate("/reviewer");
      } else if (auth.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/contributor");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Project Repository System
          </h1>
          <p className="text-gray-600">
            Academic Project Management Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-gray-200 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your institutional credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                New user?{" "}
                <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                  Create an account
                </Link>
              </p>
              <p>For assistance, contact IT support</p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-8">
          © 2026 College Project Repository System
        </p>
      </div>
    </div>
  );
}
