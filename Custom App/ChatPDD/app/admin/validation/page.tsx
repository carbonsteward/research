"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, AlertTriangle, CheckCircle, Info, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ValidationPage() {
  const { toast } = useToast()
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const runValidation = async () => {
    setLoading(true)

    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/admin/validation/run');
      // const data = await response.json();

      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockIssues = [
        {
          type: "error",
          entity: "CarbonStandard",
          id: "1",
          message: 'Standard "Example Standard" has invalid website URL',
        },
        {
          type: "warning",
          entity: "Methodology",
          id: "2",
          message: 'Methodology "Example Methodology" has no PDD requirements',
        },
        {
          type: "warning",
          entity: "Policy",
          id: "3",
          message: 'Policy "Example Policy" has no sectors',
        },
        {
          type: "info",
          entity: "PhysicalRiskData",
          id: "4",
          message: "Low confidence (0.3) for Temperature Increase in USA (NGFS Current Policies, 2050)",
        },
      ]

      setIssues(mockIssues)
      setLastRun(new Date().toISOString())

      toast({
        title: "Validation completed",
        description: `Found ${mockIssues.length} issues.`,
      })
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "There was an error running the validation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runValidation()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Validation</h1>
        <Button onClick={runValidation} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Validation
            </>
          )}
        </Button>
      </div>

      {lastRun && <p className="text-sm text-gray-500 mb-6">Last run: {new Date(lastRun).toLocaleString()}</p>}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All Issues
            <Badge variant="secondary" className="ml-2">
              {issues.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="errors">
            Errors
            <Badge variant="destructive" className="ml-2">
              {issues.filter((i) => i.type === "error").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="warnings">
            Warnings
            <Badge variant="secondary" className="ml-2 bg-amber-500">
              {issues.filter((i) => i.type === "warning").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="info">
            Info
            <Badge variant="secondary" className="ml-2">
              {issues.filter((i) => i.type === "info").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ValidationIssuesList issues={issues} />
        </TabsContent>

        <TabsContent value="errors">
          <ValidationIssuesList issues={issues.filter((i) => i.type === "error")} />
        </TabsContent>

        <TabsContent value="warnings">
          <ValidationIssuesList issues={issues.filter((i) => i.type === "warning")} />
        </TabsContent>

        <TabsContent value="info">
          <ValidationIssuesList issues={issues.filter((i) => i.type === "info")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ValidationIssuesList({ issues }: { issues: any[] }) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium">No issues found</h3>
              <p className="mt-1 text-sm text-gray-500">All data passed validation checks.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {issues.map((issue, index) => (
        <Alert key={index} variant={issue.type === "error" ? "destructive" : "default"}>
          {issue.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : issue.type === "warning" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertTitle className="flex items-center">
            {issue.entity}
            <Badge variant="outline" className="ml-2">
              {issue.type}
            </Badge>
          </AlertTitle>
          <AlertDescription>{issue.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
