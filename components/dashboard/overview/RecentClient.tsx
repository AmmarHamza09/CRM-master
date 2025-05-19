'use client'

import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useSession } from 'next-auth/react'

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  description?: string;
  color?: string;
  allDay?: boolean;
}
export default function RecentClient() {

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { data: session } = useSession()


  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      setEvents(data);
    }
    fetchEvents();
  }, [session]);



  return (
    <Card >
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Meetings</CardTitle>
          <CardDescription>
            Recent meetings with your clients.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/dashboard/calendar">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Events</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        {events?.map((event, index) => {
          if (index > 5) return null
          return (
            <TableRow>
              <TableCell>
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {event.description}
                  </div>
                </div>
              </TableCell>
            </TableRow>

            // <div className="flex items-center gap-4">

            //   <div className="grid gap-1">
            //     <p className="text-sm font-medium leading-none">
            //       {event.title}
            //     </p>
            //   </div>
            // </div>
          )
        })}
        {/* <div className="flex items-center gap-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">
              Olivia Martin
            </p>
            <p className="text-sm text-muted-foreground">
              olivia.martin@email.com
            </p>
          </div>
          <div className="ml-auto font-medium">+$1,999.00</div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="hidden h-9 w-9 sm:flex">
            <AvatarImage src="/avatars/02.png" alt="Avatar" />
            <AvatarFallback>JL</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">
              Jackson Lee
            </p>
            <p className="text-sm text-muted-foreground">
              jackson.lee@email.com
            </p>
          </div>
          <div className="ml-auto font-medium">+$39.00</div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="hidden h-9 w-9 sm:flex">
            <AvatarImage src="/avatars/03.png" alt="Avatar" />
            <AvatarFallback>IN</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">
              Isabella Nguyen
            </p>
            <p className="text-sm text-muted-foreground">
              isabella.nguyen@email.com
            </p>
          </div>
          <div className="ml-auto font-medium">+$299.00</div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="hidden h-9 w-9 sm:flex">
            <AvatarImage src="/avatars/04.png" alt="Avatar" />
            <AvatarFallback>WK</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">
              William Kim
            </p>
            <p className="text-sm text-muted-foreground">
              will@email.com
            </p>
          </div>
          <div className="ml-auto font-medium">+$99.00</div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="hidden h-9 w-9 sm:flex">
            <AvatarImage src="/avatars/05.png" alt="Avatar" />
            <AvatarFallback>SD</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">
              Sofia Davis
            </p>
            <p className="text-sm text-muted-foreground">
              sofia.davis@email.com
            </p>
          </div>
          <div className="ml-auto font-medium">+$39.00</div>
        </div> */}
      </CardContent>
    </Card>
  )
}
