import Link from "next/link";
import { Calendar, Briefcase } from "lucide-react";

const Sidebar = () => {
  const pathname = "/dashboard/calendar";

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard/calendar"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
          pathname === "/dashboard/calendar" ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
      >
        <Calendar className="h-4 w-4" />
        Calendar
      </Link>
      <Link
        href="/dashboard/jobs"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
          pathname === "/dashboard/jobs" ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
      >
        <Briefcase className="h-4 w-4" />
        Jobs
      </Link>
    </div>
  );
};

export default Sidebar; 