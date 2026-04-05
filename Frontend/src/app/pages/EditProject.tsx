import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { departments, academicYears } from "../constants/options";
import { ArrowLeft, Save } from "lucide-react";
import { ApiError } from "../api/client";
import { getProjectById, updateProject } from "../api/projectApi";

export function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    abstractText: "",
    department: "",
    academicYear: "",
    gitRepositoryUrl: "",
    technologyStack: "",
  });

  useEffect(() => {
    if (!Number.isFinite(projectId)) {
      setError("Invalid project id");
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const project = await getProjectById(projectId);
        setFormData({
          title: project.title,
          abstractText: project.abstractText ?? "",
          department: project.department,
          academicYear: project.academicYear,
          gitRepositoryUrl: project.gitRepositoryUrl ?? "",
          technologyStack: project.technologyStack ?? "",
        });
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load project");
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [projectId]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.department || !formData.academicYear) {
      setError("Title, department, and academic year are required");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await updateProject(projectId, {
        title: formData.title.trim(),
        abstractText: formData.abstractText.trim(),
        department: formData.department,
        academicYear: formData.academicYear,
        gitRepositoryUrl: formData.gitRepositoryUrl.trim(),
        technologyStack: formData.technologyStack.trim(),
      });

      navigate(`/project/${projectId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update project");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-gray-600">Loading project...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Edit Project</h1>
          <p className="text-gray-600 mt-1">Update project details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Edit metadata for your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstractText">Abstract / Description</Label>
            <Textarea
              id="abstractText"
              rows={6}
              value={formData.abstractText}
              onChange={(e) => handleChange('abstractText', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
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

            <div className="space-y-2">
              <Label>Academic Year *</Label>
              <Select value={formData.academicYear} onValueChange={(value) => handleChange('academicYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologyStack">Technology Stack</Label>
            <Input
              id="technologyStack"
              placeholder="React, Spring Boot, MySQL"
              value={formData.technologyStack}
              onChange={(e) => handleChange('technologyStack', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitRepositoryUrl">Git Repository URL</Label>
            <Input
              id="gitRepositoryUrl"
              value={formData.gitRepositoryUrl}
              onChange={(e) => handleChange('gitRepositoryUrl', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end pb-8">
        <Button size="lg" onClick={handleSave} className="gap-2" disabled={isSaving}>
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
