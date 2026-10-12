"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { daysBetween, formatDate } from "@/lib/utils";
import { leaveTypeLabel, type LeaveRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ErrorNote, PageHeader } from "@/components/page-header";

export default function MyLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.myLeaves().then(setLeaves).catch((e) => setError(e.message));
  }, []);

  const rows = [...(leaves ?? [])].sort((a, b) => b.requestId - a.requestId);

  return (
    <>
      <PageHeader
        title="My requests"
        description="Every leave request you have sent, newest first."
        action={<Button asChild><Link href="/apply">Apply for leave</Link></Button>}
      />
      {error && <ErrorNote message={error} />}
      <Card>
        {leaves && rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.requestId}>
                  <TableCell>{leaveTypeLabel(l.leaveType)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(l.startDate)} – {formatDate(l.endDate)}</TableCell>
                  <TableCell>{daysBetween(l.startDate, l.endDate)}</TableCell>
                  <TableCell className="max-w-[240px] truncate" title={l.reason}>{l.reason}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
