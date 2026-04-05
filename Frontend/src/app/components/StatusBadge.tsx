import { Badge } from "./ui/badge";
import { ProjectStatus } from "../api/types";

interface StatusBadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  const getStatusLabel = () => {
    switch (normalizedStatus) {
      case 'DRAFT':
        return 'Draft';
      case 'SUBMITTED':
        return 'Submitted';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return String(status);
    }
  };

  const getStatusColor = () => {
    switch (normalizedStatus) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'ARCHIVED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor()} font-medium`}>
      {getStatusLabel()}
    </Badge>
  );
}
