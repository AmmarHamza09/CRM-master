"use client";

import React, { useState, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
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
import { Calendar, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';

interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  description?: string;
  color?: string;
  allDay?: boolean;
}

const eventColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    start: new Date(),
    description: '',
    color: eventColors[0].value,
    allDay: false,
  });

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      setEvents(data);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    console.log("events", events);
  }, [events]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setNewEvent({
      title: '',
      start: selectInfo.start,
      end: selectInfo.end,
      description: '',
      color: eventColors[0].value,
      allDay: selectInfo.allDay,
    });
    setSelectedEvent(null);
    setIsDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start || new Date(),
      end: event.end || undefined,
      description: event.extendedProps?.description as string,
      color: event.backgroundColor,
      allDay: event.allDay,
    });
    setNewEvent({
      id: event.id,
      title: event.title,
      start: event.start || new Date(),
      end: event.end || undefined,
      description: event.extendedProps?.description as string,
      color: event.backgroundColor,
      allDay: event.allDay,
    });
    setIsDialogOpen(true);
  }, []);

  const handleEventSubmit = useCallback(async () => {
    try {
      if (newEvent.id) {
        // Update existing event
        const response = await fetch(`/api/calendar/${newEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEvent),
        });
        
        if (!response.ok) throw new Error('Failed to update event');
        
        const updatedEvent = await response.json();
        setEvents(events.map(event => 
          event.id === newEvent.id ? updatedEvent : event
        ));
      } else {
        // Add new event
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEvent),
        });
        
        if (!response.ok) throw new Error('Failed to create event');
        
        const createdEvent = await response.json();
        setEvents([...events, createdEvent]);
      }
      setIsDialogOpen(false);
      setNewEvent({ title: '', start: new Date(), description: '', color: eventColors[0].value });
    } catch (error) {
      console.error('Error saving event:', error);
      // You might want to show an error toast here
    }
  }, [events, newEvent]);

  const handleEventDelete = useCallback(async () => {
    if (selectedEvent) {
      try {
        const response = await fetch(`/api/calendar/${selectedEvent.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete event');
        
        setEvents(events.filter(event => event.id !== selectedEvent.id));
        setIsDialogOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
        // You might want to show an error toast here
      }
    }
  }, [events, selectedEvent]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button onClick={() => {
          setNewEvent({ title: '', start: new Date(), description: '', color: eventColors[0].value });
          setSelectedEvent(null);
          setIsDialogOpen(true);
        }}>
          <Calendar className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events.map(event => ({
            ...event,
            backgroundColor: event.color,
            borderColor: event.color,
          }))}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
          dayCellClassNames="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
          eventClassNames="cursor-pointer"
          dayHeaderClassNames="font-semibold text-gray-700 dark:text-gray-300"
          dayCellContent={(arg) => (
            <div className="flex items-center justify-center h-full text-gray-900 dark:text-gray-100">
              {arg.dayNumberText}
            </div>
          )}
          eventContent={(arg) => (
            <div className="p-1">
              <div className="text-sm font-medium truncate text-white">{arg.event.title}</div>
              {!arg.event.allDay && (
                <div className="text-xs text-gray-200">
                  {arg.timeText}
                </div>
              )}
            </div>
          )}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          expandRows={true}
          stickyHeaderDates={true}
          nowIndicator={true}
          dayMaxEventRows={true}
          moreLinkText="+%d more"
          moreLinkClick="popover"
          themeSystem="auto"
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day'
          }}
          buttonIcons={{
            prev: 'chevron-left',
            next: 'chevron-right'
          }}
          buttonHints={{
            prev: 'Previous',
            next: 'Next',
            today: 'Today'
          }}
          moreLinkClassNames="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          moreLinkContent={(arg) => (
            <span className="text-sm font-medium">
              +{arg.num} more
            </span>
          )}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {selectedEvent ? 'Make changes to your event here.' : 'Add details for your new event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3"
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Select
                value={newEvent.color}
                onValueChange={(value: string) => setNewEvent({ ...newEvent, color: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {eventColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start" className="text-right">
                Start
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={newEvent.start?.toISOString().slice(0, 16)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end" className="text-right">
                End
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={newEvent.end?.toISOString().slice(0, 16)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3"
                placeholder="Event description"
              />
            </div>
          </div>
          <DialogFooter>
            {selectedEvent && (
              <Button variant="destructive" onClick={handleEventDelete}>
                Delete
              </Button>
            )}
            <Button type="submit" onClick={handleEventSubmit}>
              {selectedEvent ? 'Save Changes' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 