export type Role = "EMPLOYEE" | "ADMIN";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeaveType = "CASUAL" | "SICK" | "ANNUAL" | "OTHER";

export const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: "CASUAL", label: "Casual leave" },
  { value: "SICK", label: "Sick leave" },
  { value: "ANNUAL", label: "Annual leave" },
  { value: "OTHER", label: "Other" },
];

export const leaveTypeLabel = (t: LeaveType) =>
  LEAVE_TYPES.find((x) => x.value === t)?.label ?? t;

export interface Session {
  token: string;
  role: Role;
  employeeId: number;
  name: string;
}

export interface Employee {
  employeeId: number;
  name: string;
  email: string;
  department: string;
  totalLeaves: number;
  leaveTaken: number;
  role?: Role;
}

export interface EmployeeInput {
  name: string;
  email: string;
  department: string;
  totalLeaves: number;
  role: Role;
  password?: string;
}

export interface LeaveRequest {
  requestId: number;
  employeeId: number;
  employeeName?: string;
  leaveType: LeaveType;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  reason: string;
  status: LeaveStatus;
}

export interface NewLeave {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
