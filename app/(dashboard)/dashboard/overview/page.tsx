"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Briefcase, Building2, MapPin, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

const eventColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
];

interface Job {
  id: string;
  title: string;
  endDate: string;
  status: string;
  priority: string;
  company?: string;
  location?: string;
  budget?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  recentAmount?: number;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  clientName: string;
  color?: string;
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs
      const jobsResponse = await fetch('/api/projects?limit=4');
      if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);

      // Fetch clients
      const clientsResponse = await fetch('/api/clients?limit=10');
      if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
      const clientsData = await clientsResponse.json();
      setClients(clientsData);

      // Fetch meetings
      const meetingsResponse = await fetch('/api/meetings?limit=5');
      if (!meetingsResponse.ok) throw new Error('Failed to fetch meetings');
      const meetingsData = await meetingsResponse.json();
      // Assign colors to meetings if they don't have one
      const meetingsWithColors = meetingsData.map((meeting: Meeting, index: number) => ({
        ...meeting,
        color: meeting.color || eventColors[index % eventColors.length].value
      }));
      setMeetings(meetingsWithColors);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const dueDate = new Date(endDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{job.title}</h3>
                <Badge className={`${getPriorityColor(job.priority)}`}>
                  {job.priority}
                </Badge>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                {job.endDate && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Due: {new Date(job.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Upcoming Meetings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">{meeting.title}</h3>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: meeting.color }}
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{meeting.clientName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(meeting.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 