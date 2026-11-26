"use client"

import { useSearchParams } from "next/navigation"
import axios from "axios"
import { useQuery, useMutation } from "@tanstack/react-query"
import { ComponentProps, useEffect, useState } from "react"
import { Badge } from "@/components/reui/badge"
import { SpinnerEmpty } from "../spinner"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { GripVerticalIcon, XIcon } from "lucide-react"

type ColumnKey = "upNext" | "inProgress" | "done"
type Priority = "low" | "medium" | "high"

interface ApiIssue {
  id: number
  title: string
  boardId: number
  status: string
  userId: number | null
  priority?: string
  createdAt: string
}

interface MemberResponse {
  members?: Array<{
    username?: string
  }>
}

interface Task {
  id: string
  title: string
  priority: Priority
  description?: string
  assignee?: string
  assigneeAvatar?: string
  dueDate?: string
}

const COLUMN_TITLES: Record<ColumnKey, string> = {
  upNext: "Up Next",
  inProgress: "In Progress",
  done: "Done",
}

const EMPTY_COLUMNS: Record<ColumnKey, Task[]> = {
  upNext: [],
  inProgress: [],
  done: [],
}

function normalizeStatus(status?: string): ColumnKey {
  const s = (status ?? "").toLowerCase().replace(/[\s_-]/g, "")
  if (s === "inprogress") return "inProgress"
  if (s === "done" || s === "completed") return "done"
  return "upNext"
}

function normalizePriority(priority?: string): Priority {
  const p = (priority ?? "").trim().toLowerCase()
  if (p === "high" || p === "hight") return "high"
  if (p === "low") return "low"
  return "medium"
}

function groupIssuesByColumn(
  issues: ApiIssue[] = []
): Record<ColumnKey, Task[]> {
  const grouped: Record<ColumnKey, Task[]> = {
    upNext: [],
    inProgress: [],
    done: [],
  }

  for (const issue of issues) {
    const col = normalizeStatus(issue.status)

    grouped[col].push({
      id: String(issue.id),
      title: issue.title,
      priority: normalizePriority(issue.priority),
      dueDate: issue.createdAt
        ? new Date(issue.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : undefined,
    })
  }

  return grouped
}

function IssueAssignee({ issueId }: { issueId: string }) {
  const numericId = Number(issueId)

  const membersQuery = useQuery({
    queryKey: ["issue-members", numericId],
    enabled: Number.isInteger(numericId) && numericId > 0,
    retry: false,
    queryFn: async () => {
      try {
        const apiURL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        const res = await axios.get<MemberResponse>(`${apiURL}/members`, {
          params: { issueId: numericId },
          withCredentials: true,
        })
        return res.data.members?.[0]?.username ?? null
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return null
        }
        console.error("Failed to load issue member:", err)
        return null
      }
    },
  })

  if (!membersQuery.data) {
    return <span className="italic">Unassigned</span>
  }

  return (
    <div className="flex items-center gap-1">
      <Avatar className="size-4">
        <AvatarImage src="" />
        <AvatarFallback>
          {membersQuery.data.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="line-clamp-1">{membersQuery.data}</span>
    </div>
  )
}

interface TaskCardProps extends Omit<
  ComponentProps<typeof KanbanItem>,
  "value" | "children"
> {
  task: Task
  asHandle?: boolean
  isOverlay?: boolean
  onDelete?: (issueId: number) => void
  isDeleting?: boolean
}

function TaskCard({
  task,
  asHandle,
  isOverlay,
  onDelete,
  isDeleting,
  ...props
}: TaskCardProps) {
  const handleRemove = () => {
    if (!onDelete) return
    onDelete(Number(task.id))
  }

  const cardBody = (
    <CardContent className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 pr-6">
        <span className="line-clamp-1 text-sm font-medium">{task.title}</span>
        <Badge
          variant={
            task.priority === "high"
              ? "destructive-light"
              : task.priority === "medium"
                ? "primary-light"
                : "warning-light"
          }
          className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-xs capitalize"
        >
          {task.priority}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <IssueAssignee issueId={task.id} />
        {task.dueDate && (
          <time className="text-[10px] whitespace-nowrap tabular-nums">
            {task.dueDate}
          </time>
        )}
      </div>
    </CardContent>
  )

  return (
    <KanbanItem value={task.id} {...props}>
      <Card className="relative">
        {!isOverlay && onDelete && (
          <button
            type="button"
            aria-label={`Remove ${task.title}`}
            disabled={isDeleting}
            onClick={handleRemove}
            className="absolute top-2 right-2 z-10 flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
        {asHandle && !isOverlay ? (
          <KanbanItemHandle>{cardBody}</KanbanItemHandle>
        ) : (
          cardBody
        )}
      </Card>
    </KanbanItem>
  )
}

interface TaskColumnProps extends Omit<
  ComponentProps<typeof KanbanColumn>,
  "children" | "value"
> {
  value: ColumnKey
  tasks: Task[]
  isOverlay?: boolean
  onDeleteIssue?: (issueId: number) => void
  isDeleting?: boolean
}

function TaskColumn({
  value,
  tasks,
  isOverlay,
  onDeleteIssue,
  isDeleting,
  ...props
}: TaskColumnProps) {
  return (
    <KanbanColumn value={value} {...props}>
      <Card className="mb-2.5">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold">
              {COLUMN_TITLES[value]}
            </span>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
          <KanbanColumnHandle
            render={(props) => (
              <Button {...props} size="icon-xs" variant="ghost">
                <GripVerticalIcon />
              </Button>
            )}
          />
        </CardHeader>
        <CardContent>
          <KanbanColumnContent value={value} className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                asHandle={!isOverlay}
                isOverlay={isOverlay}
                onDelete={onDeleteIssue}
                isDeleting={isDeleting}
              />
            ))}
          </KanbanColumnContent>
        </CardContent>
      </Card>
    </KanbanColumn>
  )
}

export function Pattern() {
  const searchParams = useSearchParams()
  const boardId = Number(searchParams.get("boardId"))
  const isValidBoard = Number.isInteger(boardId) && boardId > 0

  const [columns, setColumns] =
    useState<Record<ColumnKey, Task[]>>(EMPTY_COLUMNS)
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const issuesQuery = useQuery({
    queryKey: ["issues", boardId],
    enabled: isValidBoard,
    queryFn: async () => {
      const res = await axios.get(`${apiURL}/issues`, {
        params: { boardId },
        withCredentials: true,
      })
      return res.data.issues as ApiIssue[]
    },
  })

  useEffect(() => {
    if (issuesQuery.data) {
      setColumns(groupIssuesByColumn(issuesQuery.data))
    }
  }, [issuesQuery.data])

  const moveIssue = useMutation({
    mutationFn: async ({
      issueId,
      status,
    }: {
      issueId: number
      status: ColumnKey
    }) => {
      const apiStatus =
        status === "inProgress" ? "inprogress" : status.toLowerCase()
      await axios.put(
        `${apiURL}/issues`,
        { status: apiStatus },
        {
          params: { issueId },
          withCredentials: true,
        }
      )
    },
    onSuccess: () => {
      issuesQuery.refetch()
    },
  })

  const deleteIssue = useMutation({
    mutationFn: async (issueId: number) => {
      await axios.delete(`${apiURL}/issues`, {
        params: { issueId },
        withCredentials: true,
      })
    },
    onSuccess: (_data, issueId) => {
      setColumns((prev) => ({
        upNext: prev.upNext.filter((t) => t.id !== String(issueId)),
        inProgress: prev.inProgress.filter((t) => t.id !== String(issueId)),
        done: prev.done.filter((t) => t.id !== String(issueId)),
      }))
      issuesQuery.refetch()
    },
    onError: (err) => {
      console.error("Delete issue failed:", err)
    },
  })

  const handleColumnsChange = (nextColumns: Record<string, Task[]>) => {
    const typedNext: Record<ColumnKey, Task[]> = {
      upNext: nextColumns.upNext ?? [],
      inProgress: nextColumns.inProgress ?? [],
      done: nextColumns.done ?? [],
    }

    const prevColumnByTask = new Map<string, ColumnKey>()
    ;(Object.keys(columns) as ColumnKey[]).forEach((colKey) => {
      columns[colKey].forEach((t) => prevColumnByTask.set(t.id, colKey))
    })

    let movedTaskId: string | null = null
    let targetColumn: ColumnKey | null = null

    ;(Object.keys(typedNext) as ColumnKey[]).forEach((colKey) => {
      typedNext[colKey].forEach((t) => {
        const oldCol = prevColumnByTask.get(t.id)
        if (oldCol && oldCol !== colKey) {
          movedTaskId = t.id
          targetColumn = colKey
        }
      })
    })

    setColumns(typedNext)

    if (movedTaskId && targetColumn) {
      moveIssue.mutate({
        issueId: Number(movedTaskId),
        status: targetColumn,
      })
    }
  }

  if (!isValidBoard) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a valid board in the URL (`?boardId=1`).
      </p>
    )
  }

  if (issuesQuery.isPending) {
    return (
      <div className="text-sm text-muted-foreground">
        {SpinnerEmpty(
          "please wait while processing your request",
          " Please wait while we process your request. Do not refresh the page."
        )}
      </div>
    )
  }

  if (issuesQuery.isError) {
    return (
      <div className="text-sm text-destructive">
        {SpinnerEmpty(
          "Failed to load your issue",
          "Try again after few Seconds."
        )}
      </div>
    )
  }

  return (
    <Kanban
      value={columns}
      onValueChange={handleColumnsChange}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid auto-rows-fr grid-cols-1 sm:grid-cols-1 md:grid-cols-3">
        {(Object.keys(columns) as ColumnKey[]).map((columnValue) => (
          <TaskColumn
            key={columnValue}
            value={columnValue}
            tasks={columns[columnValue]}
            onDeleteIssue={(issueId) => deleteIssue.mutate(issueId)}
            isDeleting={deleteIssue.isPending}
          />
        ))}
      </KanbanBoard>
      <KanbanOverlay className="rounded-md border-2 border-dashed bg-muted/10" />
    </Kanban>
  )
}
