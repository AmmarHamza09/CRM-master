"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Search, Filter, Calendar, Clock, Building2, MapPin, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from "react-hot-toast";

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
  position: number;
}

const projectTypes = Object.values(ProjectType);
const projectStatuses = Object.values(ProjectStatus);
const priorities = Object.values(ProjectPriority);

const FullCalendarComponent = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>
});

// Add type for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    project: Project;
  };
}

export default function JobsPage() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    company: '',
    location: '',
    type: ProjectType.FULL_TIME,
    status: ProjectStatus.OPEN,
    description: '',
    priority: ProjectPriority.MEDIUM,
    startDate: new Date(),
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        console.log("Fetching projects...");
        const response = await fetch('/api/projects');
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch projects:', errorText);
          throw new Error(`Failed to fetch projects: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Fetched projects:", data);
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const projectToMove = projects.find(p => p.id === result.draggableId);
    
    if (!projectToMove) return;

    // Get all projects in the destination column
    const columnProjects = projects
      .filter(p => p.status === destination.droppableId)
      .sort((a, b) => a.position - b.position);

    // Calculate new position
    let newPosition: number;
    if (columnProjects.length === 0) {
      // If column is empty, set position to 0
      newPosition = 0;
    } else if (destination.index === 0) {
      // If moving to top, set position to first item's position - 1
      newPosition = columnProjects[0].position - 1;
    } else if (destination.index >= columnProjects.length) {
      // If moving to bottom, set position to last item's position + 1
      newPosition = columnProjects[columnProjects.length - 1].position + 1;
    } else {
      // If moving between items, set position to average of surrounding items
      const prevPosition = columnProjects[destination.index - 1].position;
      const nextPosition = columnProjects[destination.index].position;
      newPosition = (prevPosition + nextPosition) / 2;
    }

    // Create a new array with the updated project
    const updatedProjects = projects.map(p => {
      if (p.id === projectToMove.id) {
        return {
          ...p,
          status: destination.droppableId as ProjectStatus,
          position: newPosition
        };
      }
      return p;
    });

    // Update state immediately
    setProjects(updatedProjects);

    try {
      // Update in database
      const response = await fetch(`/api/projects/${projectToMove.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectToMove,
          status: destination.droppableId,
          position: newPosition,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      // Revert to original state on error
      setProjects(projects);
    }
  };

  // Update the handleReorder function for same-column reordering
  const handleReorder = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const columnProjects = projects
      .filter(p => p.status === result.source.droppableId)
      .sort((a, b) => a.position - b.position);
    
    // Calculate new position
    let newPosition: number;
    if (destination.index === 0) {
      // If moving to top, set position to first item's position - 1
      newPosition = columnProjects[0].position - 1;
    } else if (destination.index >= columnProjects.length - 1) {
      // If moving to bottom, set position to last item's position + 1
      newPosition = columnProjects[columnProjects.length - 1].position + 1;
    } else {
      // If moving between items, set position to average of surrounding items
      const prevPosition = columnProjects[destination.index - 1].position;
      const nextPosition = columnProjects[destination.index].position;
      newPosition = (prevPosition + nextPosition) / 2;
    }

    // Create a new array with the updated project
    const updatedProjects = projects.map(p => {
      if (p.id === result.draggableId) {
        return {
          ...p,
          position: newPosition
        };
      }
      return p;
    });

    // Update state immediately
    setProjects(updatedProjects);

    try {
      // Update in database
      const response = await fetch(`/api/projects/${result.draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projects.find(p => p.id === result.draggableId),
          position: newPosition,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project position');
      }
    } catch (error) {
      console.error('Error updating project position:', error);
      // Revert to original state on error
      setProjects(projects);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.company) {
      console.error("Title and company are required");
      return;
    }

    try {
      // Format the project data
      const projectData = {
        title: newProject.title,
        company: newProject.company,
        description: newProject.description || "",
        location: newProject.location || "",
        type: newProject.type || ProjectType.FULL_TIME,
        status: newProject.status || ProjectStatus.OPEN,
        priority: newProject.priority || ProjectPriority.MEDIUM,
        budget: newProject.budget ? parseFloat(newProject.budget.toString()) : null,
        client: newProject.client || "",
        startDate: newProject.startDate ? new Date(newProject.startDate).toISOString() : new Date().toISOString(),
        endDate: newProject.endDate ? new Date(newProject.endDate).toISOString() : null,
      };

      console.log("Creating new project:", projectData);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create project:', errorText);
        throw new Error(`Failed to create project: ${errorText}`);
      }
      
      const createdProject = await response.json();
      console.log("Project created successfully:", createdProject);
      
      // Update the projects list with the new project
      setProjects(prevProjects => [...prevProjects, createdProject]);
      
      // Reset the form and close dialog
      setNewProject({
        title: '',
        company: '',
        location: '',
        type: ProjectType.FULL_TIME,
        status: ProjectStatus.OPEN,
        description: '',
        priority: ProjectPriority.MEDIUM,
        startDate: new Date(),
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleEditProject = async () => {
    if (selectedProject && newProject.title && newProject.company) {
      try {
        const response = await fetch(`/api/projects/${selectedProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProject),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update project');
        }
        
        const updatedProject = await response.json();
        setProjects(projects.map(p => 
          p.id === selectedProject.id ? updatedProject : p
        ));
        setIsDialogOpen(false);
        setSelectedProject(null);
        toast.success('Project updated successfully');
      } catch (error) {
        console.error('Error updating project:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update project');
      }
    }
  };

  const handleDeleteProject = async () => {
    if (selectedProject) {
      try {
        const response = await fetch(`/api/projects/${selectedProject.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete project');
        }
        
        setProjects(projects.filter(p => p.id !== selectedProject.id));
        setIsDialogOpen(false);
        setSelectedProject(null);
        toast.success('Project deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete project');
      }
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesType = filterType === 'all' || project.type === filterType;
      const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
      return matchesSearch && matchesType && matchesPriority;
    })
    .sort((a, b) => a.position - b.position);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.OPEN: return 'bg-blue-100 text-blue-800';
      case ProjectStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.REVIEW: return 'bg-purple-100 text-purple-800';
      case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case ProjectStatus.ON_HOLD: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.HIGH:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          calendar: {
            bg: '#fee2e2',
            border: '#ef4444',
            text: '#991b1b'
          }
        };
      case ProjectPriority.MEDIUM:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          calendar: {
            bg: '#fef3c7',
            border: '#f59e0b',
            text: '#92400e'
          }
        };
      case ProjectPriority.LOW:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          calendar: {
            bg: '#dcfce7',
            border: '#22c55e',
            text: '#166534'
          }
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          calendar: {
            bg: '#f3f4f6',
            border: '#9ca3af',
            text: '#1f2937'
          }
        };
    }
  };

  // Add this function to format dates properly
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return new Date().toISOString().split('T')[0];
    
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date:', date);
        return new Date().toISOString().split('T')[0];
      }
      return parsedDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Update the calendar events mapping
  const calendarEvents: CalendarEvent[] = projects
    .map(project => {
      const colors = getPriorityColor(project.priority).calendar;
      
      // Ensure we have valid dates
      const startDate = project.startDate ? new Date(project.startDate) : new Date();
      const endDate = project.endDate ? new Date(project.endDate) : new Date(startDate);
      
      // Validate dates
      if (isNaN(startDate.getTime())) {
        console.warn('Invalid start date for project:', project.id);
        return null;
      }
      
      const event: CalendarEvent = {
        id: project.id,
        title: project.title,
        start: formatDate(startDate),
        end: formatDate(endDate),
        allDay: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: {
          project
        }
      };
      
      return event;
    })
    .filter((event): event is CalendarEvent => event !== null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Business Projects</h1>
        <Button onClick={() => {
          setNewProject({
            title: '',
            company: '',
            location: '',
            type: ProjectType.FULL_TIME,
            status: ProjectStatus.OPEN,
            description: '',
            priority: ProjectPriority.MEDIUM,
            startDate: new Date(),
          });
          setSelectedProject(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {projectTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="board" className="space-y-4">
          <DragDropContext onDragEnd={(result) => {
            if (result.source.droppableId === result.destination?.droppableId) {
              handleReorder(result);
            } else {
              handleDragEnd(result);
            }
          }}>
            <div className="grid grid-cols-5 gap-4">
              {projectStatuses.map((status) => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{status}</h2>
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {filteredProjects.filter(project => project.status === status).length}
                    </Badge>
                  </div>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 min-h-[500px] p-4 bg-gray-50 rounded-lg"
                      >
                        {filteredProjects
                          .filter(project => project.status === status)
                          .sort((a, b) => a.position - b.position)
                          .map((project, index) => (
                            <Draggable key={project.id} draggableId={project.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-move"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setNewProject(project);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium">{project.title}</h3>
                                    <Badge className={`${getPriorityColor(project.priority).bg} ${getPriorityColor(project.priority).text}`}>
                                      {project.priority}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <Building2 className="h-4 w-4" />
                                    {project.company}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <MapPin className="h-4 w-4" />
                                    {project.location}
                                  </div>
                                  {project.endDate && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Clock className="h-4 w-4" />
                                      Due: {new Date(project.endDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <FullCalendarComponent
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={(info) => {
                const project = info.event.extendedProps.project;
                setSelectedProject(project);
                setNewProject(project);
                setIsDialogOpen(true);
              }}
              eventContent={(eventInfo) => {
                const project = eventInfo.event.extendedProps.project;
                return (
                  <div className="p-1">
                    <div className="font-medium truncate">{eventInfo.event.title}</div>
                    <div className="text-xs opacity-75 truncate">{project.company}</div>
                    <div className="text-xs opacity-75 truncate">
                      {project.priority} - {project.status}
                    </div>
                  </div>
                );
              }}
              height="auto"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              nowIndicator={true}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={true}
              slotDuration="00:30:00"
              slotLabelInterval="01:00"
              expandRows={true}
              stickyHeaderDates={true}
              dayHeaderFormat={{
                weekday: 'long',
                day: 'numeric'
              }}
              titleFormat={{
                month: 'long',
                year: 'numeric'
              }}
              eventDisplay="block"
              eventMinHeight={25}
              eventMinWidth={25}
              eventShortHeight={30}
              eventLongPressDelay={500}
              eventDragMinDistance={5}
              eventOverlap={true}
              eventConstraint={{
                startTime: '08:00',
                endTime: '20:00',
                dows: [0, 1, 2, 3, 4]
              }}
              eventBackgroundColor={theme === 'dark' ? '#1f2937' : '#f3f4f6'}
              eventBorderColor={theme === 'dark' ? '#374151' : '#e5e7eb'}
              eventTextColor={theme === 'dark' ? '#f3f4f6' : '#1f2937'}
              dayMaxEventRows={true}
              moreLinkContent={(args) => `+${args.num} more`}
              eventDrop={async (info) => {
                const project = info.event.extendedProps.project;
                const newStartDate = info.event.start;
                const newEndDate = info.event.end || newStartDate;
                
                try {
                  const response = await fetch(`/api/projects/${project.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      ...project,
                      startDate: newStartDate,
                      endDate: newEndDate,
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update project dates');
                  }

                  const updatedProject = await response.json();
                  setProjects(projects.map(p => 
                    p.id === project.id ? updatedProject : p
                  ));
                  toast.success('Project dates updated successfully');
                } catch (error) {
                  console.error('Error updating project dates:', error);
                  toast.error(error instanceof Error ? error.message : 'Failed to update project dates');
                  info.revert();
                }
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {selectedProject ? 'Make changes to the project here.' : 'Add details for the new project.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="col-span-3"
                placeholder="Project title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                value={newProject.company}
                onChange={(e) => setNewProject({ ...newProject, company: e.target.value })}
                className="col-span-3"
                placeholder="Company name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Input
                id="client"
                value={newProject.client || ''}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                className="col-span-3"
                placeholder="Client name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newProject.location || ''}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                className="col-span-3"
                placeholder="Project location"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newProject.type}
                onValueChange={(value) => setNewProject({ ...newProject, type: value as ProjectType })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newProject.status}
                onValueChange={(value) => setNewProject({ ...newProject, status: value as ProjectStatus })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={newProject.priority}
                onValueChange={(value) => setNewProject({ ...newProject, priority: value as ProjectPriority })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input
                id="budget"
                type="number"
                value={newProject.budget || ''}
                onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                className="col-span-3"
                placeholder="Project budget"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newProject.description || ''}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="col-span-3"
                placeholder="Project description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Deadline
              </Label>
              <Input
                id="endDate"
                type="date"
                value={newProject.endDate ? new Date(newProject.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background border-t pt-4">
            {selectedProject && (
              <Button variant="destructive" onClick={handleDeleteProject}>
                Delete
              </Button>
            )}
            <Button type="submit" onClick={selectedProject ? handleEditProject : handleAddProject}>
              {selectedProject ? 'Save Changes' : 'Add Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 