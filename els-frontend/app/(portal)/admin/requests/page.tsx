"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { daysBetween, formatDate } from "@/lib/utils";
import { leaveTypeLabel, type LeaveRequest, type LeaveStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ErrorNote, PageHeader } from "@/components/page-header";

const filters: { value: LeaveStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

export default function AdminRequestsPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [filter, setFilter] = useState<LeaveStatus | "ALL">("PENDING");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.allLeaves().then(setLeaves).catch((e) => setError(e.message));
  }, []);

  async function decide(id: number, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    setError("");
    try {
      const updated = await api.setLeaveStatus(id, status);
      setLeaves((prev) => prev?.map((l) => (l.requestId === id ? { ...l, ...updated, status } : l)) ?? prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the decision.");
    } finally {
      setBusyId(null);
    }
  }

  const rows = (leaves ?? [])
    .filter((l) => filter === "ALL" || l.status === filter)
    .sort((a, b) => b.requestId - a.requestId);

  return (
    <>
      <PageHeader title="Leave requests" description="Approve or reject what your team has asked for." />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {filters.map((f) => (
          <Button key={f.value} size="sm" variant={filter === f.value ? "default" : "outline"} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
            {leaves && f.value !== "ALL" && (
              <span className="opacity-70">{leaves.filter((l) => l.status === f.value).length}</span>
            )}
          </Button>
        ))}
      </div>
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}
      <Card>
        {leaves && rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            {filter === "PENDING" ? "Nothing is waiting for a decision." : "No requests match this filter."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.requestId}>
                  <TableCell className="font-medium">{l.employeeName ?? `Employee #${l.employeeId}`}</TableCell>
                  <TableCell>{leaveTypeLabel(l.leaveType)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(l.startDate)} – {formatDate(l.endDate)}</TableCell>
                  <TableCell>{daysBetween(l.startDate, l.endDate)}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={l.reason}>{l.reason}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                  <TableCell>
                    {l.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" disabled={busyId === l.requestId} onClick={() => decide(l.requestId, "APPROVED")}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" disabled={busyId === l.requestId} onClick={() => decide(l.requestId, "REJECTED")}>
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
