"use client"
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecentClient from "@/components/dashboard/overview/RecentClient";
import RecentProjects from "@/components/dashboard/overview/RecentProjects";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Clock, Building2, MapPin, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
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

interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  client: string;
  project: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects
        const projectsResponse = await fetch('/api/projects?limit=4');
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);

        // Fetch payments
        const paymentsResponse = await fetch('/api/payments?limit=5');
        if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    if (session?.user) {
      fetchData();
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate payment statistics
  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + payment.amount : sum, 0
  );
  const pendingPayments = payments.filter(payment => payment.status === 'pending');
  const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Payment Statistics */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Payments</p>
              <h3 className="text-2xl font-bold">${pendingAmount.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Payments</p>
              <h3 className="text-2xl font-bold">{payments.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Grid */}
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

      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <RecentProjects/>
        <RecentClient/>
        {/* Recent Payments */}
        <Card className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent Payments</h2>
                <p className="text-sm text-gray-500">Latest payment transactions</p>
              </div>
              <button 
                onClick={() => router.push('/dashboard/payments')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push('/dashboard/payments')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{payment.project}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{payment.client}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">${payment.amount.toFixed(2)}</span>
                    <Badge className={`${getPaymentStatusColor(payment.status)} text-xs`}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
