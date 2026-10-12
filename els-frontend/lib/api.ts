import type {
  Employee,
  EmployeeInput,
  LeaveRequest,
  LeaveStatus,
  NewLeave,
  Session,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export const SESSION_KEY = "els_session";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session).token : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check that the backend is running.", 0);
  }

  if (res.status === 401 && token && typeof window !== "undefined") {
    // Token expired or invalid: sign out and go to login.
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "/login";
  }
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {}
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<Session>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Employee
  me: () => request<Employee>("/api/employees/me"),
  myLeaves: () => request<LeaveRequest[]>("/api/leaves/my"),
  applyLeave: (data: NewLeave) =>
    request<LeaveRequest>("/api/leaves", { method: "POST", body: JSON.stringify(data) }),

  // Admin
  allLeaves: () => request<LeaveRequest[]>("/api/admin/leaves"),
  setLeaveStatus: (id: number, status: Exclude<LeaveStatus, "PENDING">) =>
    request<LeaveRequest>(`/api/admin/leaves/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  employees: () => request<Employee[]>("/api/admin/employees"),
  createEmployee: (data: EmployeeInput) =>
    request<Employee>("/api/admin/employees", { method: "POST", body: JSON.stringify(data) }),
  updateEmployee: (id: number, data: EmployeeInput) =>
    request<Employee>(`/api/admin/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEmployee: (id: number) =>
    request<void>(`/api/admin/employees/${id}`, { method: "DELETE" }),
};
