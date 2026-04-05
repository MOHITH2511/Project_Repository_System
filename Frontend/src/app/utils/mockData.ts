export type ProjectStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Archived';

export interface Project {
  id: string;
  title: string;
  abstract: string;
  department: string;
  academicYear: string;
  technologyStack: string[];
  keywords: string[];
  facultyGuide: string;
  gitRepository: string;
  teamMembers: string[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  documents: DocumentVersion[];
  reviews: Review[];
}

export interface DocumentVersion {
  id: string;
  version: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  decision: 'Approved' | 'Rejected' | 'Changes Requested';
  comments: string;
  reviewedAt: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'AI-Powered Student Attendance System',
    abstract: 'A machine learning based attendance tracking system using facial recognition to automate the attendance process in classrooms. The system provides real-time analytics and automated reporting for faculty.',
    department: 'Computer Science',
    academicYear: '2025-2026',
    technologyStack: ['Python', 'TensorFlow', 'React', 'Node.js', 'MongoDB'],
    keywords: ['Machine Learning', 'Facial Recognition', 'Attendance', 'Computer Vision'],
    facultyGuide: 'Dr. Priya Sharma',
    gitRepository: 'https://github.com/team/attendance-system',
    teamMembers: ['Rahul Kumar', 'Priya Singh', 'Amit Patel'],
    status: 'Under Review',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-20',
    documents: [
      {
        id: 'd1',
        version: 'v2.0',
        fileName: 'project-report-final.pdf',
        uploadedBy: 'Rahul Kumar',
        uploadedAt: '2026-02-20',
        fileSize: '4.2 MB',
      },
      {
        id: 'd2',
        version: 'v1.0',
        fileName: 'project-report-draft.pdf',
        uploadedBy: 'Rahul Kumar',
        uploadedAt: '2026-02-10',
        fileSize: '3.8 MB',
      },
    ],
    reviews: [
      {
        id: 'r1',
        reviewerName: 'Dr. Rajesh Verma',
        decision: 'Changes Requested',
        comments: 'Please include more details about the accuracy metrics and testing methodology. The privacy considerations section needs expansion.',
        reviewedAt: '2026-02-22',
      },
    ],
  },
  {
    id: '2',
    title: 'Campus Event Management Platform',
    abstract: 'A comprehensive web platform for managing college events, including registration, ticketing, analytics, and automated communications. Features real-time event updates and participant tracking.',
    department: 'Information Technology',
    academicYear: '2025-2026',
    technologyStack: ['React', 'Express', 'PostgreSQL', 'Redis', 'AWS'],
    keywords: ['Event Management', 'Web Development', 'Cloud Computing'],
    facultyGuide: 'Prof. Anjali Desai',
    gitRepository: 'https://github.com/team/event-platform',
    teamMembers: ['Sneha Reddy', 'Vikram Joshi'],
    status: 'Approved',
    createdAt: '2026-01-10',
    updatedAt: '2026-02-25',
    documents: [
      {
        id: 'd3',
        version: 'v1.2',
        fileName: 'final-submission.pdf',
        uploadedBy: 'Sneha Reddy',
        uploadedAt: '2026-02-15',
        fileSize: '5.1 MB',
      },
    ],
    reviews: [
      {
        id: 'r2',
        reviewerName: 'Dr. Sanjay Mehta',
        decision: 'Approved',
        comments: 'Excellent implementation with comprehensive documentation. The scalability approach is well thought out.',
        reviewedAt: '2026-02-25',
      },
    ],
  },
  {
    id: '3',
    title: 'Library Resource Management System',
    abstract: 'Digital library management system with book inventory, member management, and automated fine calculation. Includes QR code based check-in/check-out system.',
    department: 'Computer Science',
    academicYear: '2025-2026',
    technologyStack: ['Angular', 'Spring Boot', 'MySQL', 'Docker'],
    keywords: ['Library Management', 'QR Code', 'Inventory System'],
    facultyGuide: 'Dr. Kavita Iyer',
    gitRepository: 'https://github.com/team/library-system',
    teamMembers: ['Arjun Nair', 'Meera Krishnan', 'Karthik Raj', 'Divya Menon'],
    status: 'Draft',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-26',
    documents: [],
    reviews: [],
  },
  {
    id: '4',
    title: 'Smart Energy Monitoring for Campus',
    abstract: 'IoT-based energy consumption monitoring system for college campus. Provides real-time data visualization, predictive analytics, and automated alerts for energy wastage.',
    department: 'Electronics and Communication',
    academicYear: '2025-2026',
    technologyStack: ['IoT', 'Raspberry Pi', 'InfluxDB', 'Grafana', 'Python'],
    keywords: ['IoT', 'Energy Monitoring', 'Data Visualization', 'Sustainability'],
    facultyGuide: 'Dr. Suresh Kumar',
    gitRepository: 'https://github.com/team/energy-monitor',
    teamMembers: ['Nikhil Sharma', 'Pooja Gupta'],
    status: 'Submitted',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-18',
    documents: [
      {
        id: 'd4',
        version: 'v1.0',
        fileName: 'project-documentation.pdf',
        uploadedBy: 'Nikhil Sharma',
        uploadedAt: '2026-02-18',
        fileSize: '6.3 MB',
      },
    ],
    reviews: [],
  },
  {
    id: '5',
    title: 'Online Examination Portal',
    abstract: 'Secure online examination platform with anti-cheating measures, automated grading for objective questions, and comprehensive analytics dashboard for educators.',
    department: 'Information Technology',
    academicYear: '2024-2025',
    technologyStack: ['Vue.js', 'Django', 'PostgreSQL', 'WebRTC'],
    keywords: ['E-Learning', 'Examination', 'Security', 'Web Development'],
    facultyGuide: 'Prof. Ramesh Pillai',
    gitRepository: 'https://github.com/team/exam-portal',
    teamMembers: ['Aditya Kapoor', 'Riya Malhotra', 'Siddharth Sen'],
    status: 'Archived',
    createdAt: '2025-09-10',
    updatedAt: '2025-12-20',
    documents: [
      {
        id: 'd5',
        version: 'v2.1',
        fileName: 'complete-project-report.pdf',
        uploadedBy: 'Aditya Kapoor',
        uploadedAt: '2025-12-15',
        fileSize: '7.8 MB',
      },
    ],
    reviews: [
      {
        id: 'r3',
        reviewerName: 'Dr. Meena Krishnan',
        decision: 'Approved',
        comments: 'Outstanding project with innovative security features. Well documented and implemented.',
        reviewedAt: '2025-12-18',
      },
    ],
  },
];

export const currentUser = {
  name: 'Rahul Kumar',
  email: 'rahul.kumar@college.edu',
  role: 'Contributor' as 'Contributor' | 'Reviewer' | 'Administrator',
};

export const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
];

export const academicYears = [
  '2026-2027',
  '2025-2026',
  '2024-2025',
  '2023-2024',
];
