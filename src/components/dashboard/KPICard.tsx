import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: LucideIcon
  iconColor?: string
}

export function KPICard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-gray-400",
}: KPICardProps) {
  return (
    <Card className="border-gray-100 shadow-none">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  changeType === "up" && "text-emerald-600",
                  changeType === "down" && "text-red-500",
                  changeType === "neutral" && "text-gray-400"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-2.5 rounded-xl bg-gray-50",
              iconColor
            )}
          >
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
