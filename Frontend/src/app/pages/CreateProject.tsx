import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { departments, academicYears } from "../constants/options";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { ApiError } from "../api/client";
import { createProject, submitProject } from "../api/projectApi";
import { uploadProjectDocument } from "../api/documentApi";
import { searchUsers } from "../api/userApi";
import type { AuthUser } from "../api/types";

export function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    department: "",
    academicYear: "",
    gitRepository: "",
  });

  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [facultyQuery, setFacultyQuery] = useState("");
  const [facultyOptions, setFacultyOptions] = useState<AuthUser[]>([]);
  const [isFacultyLoading, setIsFacultyLoading] = useState(false);
  const [facultySearchAttempted, setFacultySearchAttempted] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<AuthUser | null>(null);
  const [teamQuery, setTeamQuery] = useState("");
  const [teamOptions, setTeamOptions] = useState<AuthUser[]>([]);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamSearchAttempted, setTeamSearchAttempted] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<AuthUser[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (item: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (item.trim()) {
      setter(prev => [...prev, item.trim()]);
      inputSetter("");
    }
  };

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (facultyQuery.trim().length < 2) {
      setFacultyOptions([]);
      setFacultySearchAttempted(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsFacultyLoading(true);
      setFacultySearchAttempted(false);
      try {
        const users = await searchUsers("REVIEWER", facultyQuery);
        setFacultyOptions(users);
      } catch {
        setFacultyOptions([]);
      } finally {
        setIsFacultyLoading(false);
        setFacultySearchAttempted(true);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [facultyQuery]);

  useEffect(() => {
    if (teamQuery.trim().length < 2) {
      setTeamOptions([]);
      setTeamSearchAttempted(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsTeamLoading(true);
      setTeamSearchAttempted(false);
      try {
        const users = await searchUsers("CONTRIBUTOR", teamQuery);
        setTeamOptions(users.filter((user) => !selectedTeamMembers.some((selected) => selected.id === user.id)));
      } catch {
        setTeamOptions([]);
      } finally {
        setIsTeamLoading(false);
        setTeamSearchAttempted(true);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [teamQuery, selectedTeamMembers]);

  const addTeamMember = (user: AuthUser) => {
    if (selectedTeamMembers.some((member) => member.id === user.id)) {
      return;
    }
    setSelectedTeamMembers((prev) => [...prev, user]);
    setTeamQuery("");
    setTeamOptions([]);
  };

  const removeTeamMember = (userId: number) => {
    setSelectedTeamMembers((prev) => prev.filter((member) => member.id !== userId));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Project title is required";
    if (!formData.abstract.trim()) return "Project abstract is required";
    if (!formData.department.trim()) return "Department is required";
    if (!formData.academicYear.trim()) return "Academic year is required";
    if (!selectedFaculty) return "Faculty guide must be selected from reviewers";
    return null;
  };

  const buildCreatePayload = () => ({
    title: formData.title.trim(),
    abstractText: formData.abstract.trim(),
    department: formData.department,
    academicYear: formData.academicYear,
    technologyStack: technologies.join(", "),
    gitRepositoryUrl: formData.gitRepository.trim(),
    facultyGuideId: selectedFaculty?.id,
    teamMemberIds: selectedTeamMembers.map((member) => member.id),
  });

  const createProjectWithOptionalDocument = async () => {
    const created = await createProject(buildCreatePayload());

    if (selectedDocument) {
      await uploadProjectDocument(created.id, selectedDocument);
    }

    return created;
  };

  const handleSaveDraft = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createProjectWithOptionalDocument();
      navigate("/contributor");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create project");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createProjectWithOptionalDocument();
      await submitProject(created.id, crypto.randomUUID());
      navigate("/contributor");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to submit project");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details to register your academic project
          </p>
        </div>
      </div>

      {/* Project Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Basic details about your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title for your project"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract / Description *</Label>
            <Textarea
              id="abstract"
              placeholder="Provide a comprehensive description of your project objectives, methodology, and expected outcomes"
              rows={6}
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select value={formData.academicYear} onValueChange={(value) => handleInputChange('academicYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facultyGuide">Faculty Guide * (Search reviewer)</Label>
            <Input
              id="facultyGuide"
              placeholder="Type reviewer name"
              value={selectedFaculty ? `${selectedFaculty.name} (${selectedFaculty.email})` : facultyQuery}
              onChange={(e) => {
                setSelectedFaculty(null);
                setFacultyQuery(e.target.value);
              }}
            />
            {!selectedFaculty && facultyOptions.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-auto bg-white">
                {facultyOptions.map((faculty) => (
                  <button
                    key={faculty.id}
                    type="button"
                    onClick={() => {
                      setSelectedFaculty(faculty);
                      setFacultyQuery("");
                      setFacultyOptions([]);
                      setFacultySearchAttempted(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {faculty.name} • {faculty.email}
                  </button>
                ))}
              </div>
            )}
            {!selectedFaculty && facultyQuery.trim().length >= 2 && (
              <div className="text-xs text-gray-500">
                {isFacultyLoading
                  ? "Searching reviewers..."
                  : facultySearchAttempted && facultyOptions.length === 0
                  ? "No guide exists with this name/email."
                  : null}
              </div>
            )}
            {selectedFaculty && (
              <Badge variant="secondary" className="gap-2">
                {selectedFaculty.name}
                <button type="button" onClick={() => {
                  setSelectedFaculty(null);
                  setFacultyQuery("");
                  setFacultyOptions([]);
                  setFacultySearchAttempted(false);
                }} className="ml-1 hover:text-red-600">×</button>
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitRepository">Git Repository URL</Label>
            <Input
              id="gitRepository"
              type="url"
              placeholder="https://github.com/username/repository"
              value={formData.gitRepository}
              onChange={(e) => handleInputChange('gitRepository', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Initial Document */}
      <Card>
        <CardHeader>
          <CardTitle>Initial Project Document</CardTitle>
          <CardDescription>
            Upload an optional document that will be attached after the project is created
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="initialDocument">Project Document</Label>
            <Input
              id="initialDocument"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedDocument(file);
              }}
            />
          </div>
          {selectedDocument && (
            <p className="text-sm text-gray-600">
              Selected file: <span className="font-medium">{selectedDocument.name}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
          <CardDescription>Languages, frameworks, and tools used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technology">Add Technology</Label>
            <div className="flex gap-2">
              <Input
                id="technology"
                placeholder="e.g., React, Python, TensorFlow"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(techInput, setTechnologies, setTechInput))}
              />
              <Button type="button" onClick={() => addItem(techInput, setTechnologies, setTechInput)}>
                Add
              </Button>
            </div>
          </div>
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, index) => (
                <Badge key={index} variant="secondary" className="gap-2">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeItem(index, setTechnologies)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
          <CardDescription>Tags to help categorize your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Add Keyword</Label>
            <div className="flex gap-2">
              <Input
                id="keyword"
                placeholder="e.g., Machine Learning, Web Development"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(keywordInput, setKeywords, setKeywordInput))}
              />
              <Button type="button" onClick={() => addItem(keywordInput, setKeywords, setKeywordInput)}>
                Add
              </Button>
            </div>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="gap-2">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeItem(index, setKeywords)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Add your project team members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member">Add Team Member (Contributor)</Label>
            <Input
              id="member"
              placeholder="Type contributor name"
              value={teamQuery}
              onChange={(e) => setTeamQuery(e.target.value)}
            />
            {teamOptions.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-auto bg-white">
                {teamOptions.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => addTeamMember(member)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {member.name} • {member.email}
                  </button>
                ))}
              </div>
            )}
            {teamQuery.trim().length >= 2 && (
              <div className="text-xs text-gray-500">
                {isTeamLoading
                  ? "Searching contributors..."
                  : teamSearchAttempted && teamOptions.length === 0
                  ? "No team member exists with this name/email."
                  : null}
              </div>
            )}
            <p className="text-xs text-gray-500">Creator will be assigned as LEADER automatically; selected users are added as MEMBERS.</p>
          </div>
          {selectedTeamMembers.length > 0 && (
            <div className="space-y-2">
              {selectedTeamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{member.name} ({member.email})</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeamMember(member.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" size="lg" onClick={handleSaveDraft} className="gap-2" disabled={isSubmitting}>
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </Button>
        <Button size="lg" onClick={handleSubmit} className="gap-2" disabled={isSubmitting}>
          <Send className="w-4 h-4" />
          {isSubmitting ? "Submitting..." : "Submit Project"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 pb-8">{error}</p>
      )}
    </div>
  );
}
