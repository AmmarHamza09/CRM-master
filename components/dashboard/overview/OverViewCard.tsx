"use client"

import { CreditCard } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

enum ProjectPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

interface OverViewCard{
  title: string,
  priority: ProjectPriority,
  endDate?: Date
}

export default function Component({
  title,
  priority,
  endDate
}: OverViewCard) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{priority}</div>
        <p className="text-xs text-muted-foreground">{new Date(endDate).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  )
}
