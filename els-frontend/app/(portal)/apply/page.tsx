"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { daysBetween } from "@/lib/utils";
import { LEAVE_TYPES, type Employee, type LeaveType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorNote, PageHeader } from "@/components/page-header";

export default function ApplyPage() {
  const router = useRouter();
  const [me, setMe] = useState<Employee | null>(null);
  const [leaveType, setLeaveType] = useState<LeaveType>("CASUAL");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
  }, []);

  const days = daysBetween(startDate, endDate);
  const left = me ? me.totalLeaves - me.leaveTaken : null;
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (days < 1) return setError("The end date must be the same as or after the start date.");
    if (left !== null && days > left)
      return setError(`You asked for ${days} days but only have ${left} left.`);
    setBusy(true);
    try {
      await api.applyLeave({ leaveType, startDate, endDate, reason: reason.trim() });
      router.push("/my-leaves");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the request.");
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Apply for leave" description="Pick your dates and tell your administrator why." />
      <Card className="max-w-xl">
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="space-y-5">
            {error && <ErrorNote message={error} />}
            <div className="space-y-2">
              <Label htmlFor="type">Leave type</Label>
              <Select id="type" value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start">From</Label>
                <Input id="start" type="date" required min={today} value={startDate}
                  onChange={(e) => { setStart(e.target.value); if (!endDate) setEnd(e.target.value); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">To</Label>
                <Input id="end" type="date" required min={startDate || today} value={endDate} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            {days > 0 && (
              <p className="text-sm text-muted-foreground">
                {days} day{days > 1 ? "s" : ""} requested
                {left !== null && ` · ${left} days left in your balance`}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: family wedding in Lucknow" />
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send request"}</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
