"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Employee, EmployeeInput, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErrorNote, PageHeader } from "@/components/page-header";

const empty = { name: "", email: "", department: "", totalLeaves: "20", role: "EMPLOYEE" as Role, password: "" };

export default function AdminEmployeesPage() {
  const [list, setList] = useState<Employee[] | null>(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.employees().then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function startNew() {
    setForm(empty); setEditingId(null); setError(""); setOpen(true);
  }
  function startEdit(emp: Employee) {
    setForm({ name: emp.name, email: emp.email, department: emp.department, totalLeaves: String(emp.totalLeaves), role: emp.role ?? "EMPLOYEE", password: "" });
    setEditingId(emp.employeeId); setError(""); setOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    const data: EmployeeInput = {
      name: form.name.trim(), email: form.email.trim(), department: form.department.trim(),
      totalLeaves: Number(form.totalLeaves), role: form.role,
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (editingId === null) await api.createEmployee(data);
      else await api.updateEmployee(editingId, data);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the employee.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(emp: Employee) {
    if (!window.confirm(`Delete ${emp.name}? Their leave requests will go with them.`)) return;
    try {
      await api.deleteEmployee(emp.employeeId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the employee.");
    }
  }

  return (
    <>
      <PageHeader
        title="Employees"
        description="Add people, set their yearly leave days, and keep records up to date."
        action={<Button onClick={startNew}><Plus className="h-4 w-4" /> Add employee</Button>}
      />

      {open && (
        <Card className="mb-6">
          <CardHeader><CardTitle>{editingId === null ? "New employee" : "Edit employee"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              {error && <div className="sm:col-span-2"><ErrorNote message={error} /></div>}
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" required value={form.name} onChange={set("name")} /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={form.email} onChange={set("email")} /></div>
              <div className="space-y-2"><Label htmlFor="dept">Department</Label><Input id="dept" required value={form.department} onChange={set("department")} /></div>
              <div className="space-y-2"><Label htmlFor="total">Leave days per year</Label><Input id="total" type="number" min={0} required value={form.totalLeaves} onChange={set("totalLeaves")} /></div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" value={form.role} onChange={set("role")}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Administrator</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw">{editingId === null ? "Password" : "New password (optional)"}</Label>
                <Input id="pw" type="password" required={editingId === null} minLength={6} autoComplete="new-password" value={form.password} onChange={set("password")} />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save employee"}</Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!open && error && <div className="mb-4"><ErrorNote message={error} /></div>}

      <Card>
        {list && list.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No employees yet. Use “Add employee” to create the first one.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Used / total</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(list ?? []).map((emp) => (
                <TableRow key={emp.employeeId}>
                  <TableCell>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.email}</p>
                  </TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.leaveTaken} / {emp.totalLeaves}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" aria-label={`Edit ${emp.name}`} onClick={() => startEdit(emp)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label={`Delete ${emp.name}`} onClick={() => remove(emp)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
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
