"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  LayoutGrid,
  Key,
  Plug,
  Package,
  Users,
  DollarSign,
  Handshake,
  User2,
  Home,
  Calendar,
  Briefcase,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area"
import Logo from "../global/Logo";


export default function Sidebar() {
  const sidebarLinks = [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", href: "/dashboard", icon: Home },
        
      ],
    },
    {
      title: "Clients & Projects",
      items: [
        { title: "Clients", href: "/dashboard/clients", icon: Users },
        // { title: "Projects", href: "/dashboard/projects", icon: LayoutGrid },
        { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
        { title: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
      ],
    },
    {
      title: "Finance",
      items: [
        { title: "Invoices", href: "/dashboard/invoices", icon: DollarSign },
        { title: "Payments", href: "/dashboard/payments", icon: Handshake },
      ],
    },
    // {
    //   title: "Team",
    //   items: [
    //     { title: "Members", href: "/dashboard/members", icon: User2 },
    //     { title: "Roles", href: "/dashboard/roles", icon: Key },
    //   ],
    // },
    // {
    //   title: "Communication",
    //   items: [
    //     { title: "Emails", href: "/dashboard/emails", icon: User2 },
    //     { title: "Bulk Emails", href: "/dashboard/bulk-emails", icon: Key },
    //   ],
    // },
    // {
    //   title: "Reports",
    //   items: [
    //     { title: "Project Progress", href: "/dashboard/project-progress", icon: User2 },
    //     { title: "Financial Summary", href: "/dashboard/financial-summary", icon: Key },
    //     { title: "Time Tracking", href: "/dashboard/time-tracking", icon: Key },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   items: [
    //     { title: "Account Setting", href: "/dashboard/accont-setting", icon: User2 },
    //     { title: "Notifications", href: "/dashboard/notifications", icon: Key },
    //     { title: "Time Tracking", href: "/dashboard/time-tracking", icon: Key },
    //   ],
    // },
  ];

  const pathname = usePathname() as string;

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Logo href="/dashboard" title="CRMS"/>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm">
            {sidebarLinks.map((section, i) => (
              <div key={i} className="mb-4">
                <h2 className="mb-2 px-2 text-lg font-semibold text-gray-500">
                  {section.title}
                </h2>
                {section.items.map((item, j) => {
                  const Icon = item.icon;
                  const isActive = item.href === pathname;
                  return (
                    <Link
                      key={j}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-muted text-primary"
                      )}
                    >
                      <Icon className="w-5 h-5" /> {/* Ensure Icon renders */}
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
