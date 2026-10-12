"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, daysBetween } from "@/lib/utils";
import { leaveTypeLabel, type Employee, type LeaveRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DayMeter } from "@/components/day-meter";
import { StatusBadge } from "@/components/status-badge";
import { ErrorNote, PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  const { session } = useAuth();
  const [me, setMe] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.me(), api.myLeaves()])
      .then(([m, l]) => {
        setMe(m);
        setLeaves(l);
      })
      .catch((e) => setError(e.message));
  }, []);

  const left = me ? me.totalLeaves - me.leaveTaken : 0;
  const pending = leaves?.filter((l) => l.status === "PENDING").length ?? 0;
  const recent = [...(leaves ?? [])].sort((a, b) => b.requestId - a.requestId).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Hello, ${session?.name.split(" ")[0] ?? ""}`}
        description="Here is where your leave stands today."
        action={
          <Button asChild>
            <Link href="/apply">Apply for leave</Link>
          </Button>
        }
      />
      {error && <ErrorNote message={error} />}

      {me && (
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>Leave balance</CardDescription>
            <p className="font-heading text-5xl font-bold text-primary">
              {left} <span className="text-lg font-semibold text-foreground">days left</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <DayMeter total={me.totalLeaves} used={me.leaveTaken} />
            <p className="text-sm text-muted-foreground">
              {me.leaveTaken} of {me.totalLeaves} days used
              {pending > 0 && ` · ${pending} request${pending > 1 ? "s" : ""} waiting for a decision`}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent requests</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/my-leaves">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          {leaves && recent.length === 0 ? (
            <p className="px-5 pb-4 text-sm text-muted-foreground">
              You have not asked for leave yet. Use “Apply for leave” to send your first request.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((l) => (
                  <TableRow key={l.requestId}>
                    <TableCell>{leaveTypeLabel(l.leaveType)}</TableCell>
                    <TableCell>{formatDate(l.startDate)} – {formatDate(l.endDate)}</TableCell>
                    <TableCell>{daysBetween(l.startDate, l.endDate)}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
