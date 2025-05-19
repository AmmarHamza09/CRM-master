"use client"
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecentClient from "@/components/dashboard/overview/RecentClient";
import RecentProjects from "@/components/dashboard/overview/RecentProjects";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Clock, Building2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

enum ProjectStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD"
}

enum ProjectPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

enum ProjectType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP"
}

interface Project {
  id: string;
  title: string;
  description?: string;
  company: string;
  location?: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  client?: string;
  startDate: Date;
  endDate?: Date;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects?limit=4');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch projects:', errorText);
          throw new Error(`Failed to fetch projects: ${errorText}`);
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    
    if (session?.user) {
      console.log("Session found, fetching projects...");
      fetchProjects();
    } else {
      console.log("No session found, skipping fetch");
    }
  }, [session]);

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.HIGH:
        return 'bg-red-100 text-red-800';
      case ProjectPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectPriority.LOW:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/dashboard/jobs')}
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{project.title}</h3>
                <Badge className={`${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </Badge>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{project.company}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{project.location}</span>
                </div>
                {project.endDate && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <RecentProjects/>
        <RecentClient/>
      </div>
    </main>
  );
}
