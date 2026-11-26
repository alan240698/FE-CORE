import { http, HttpResponse } from "msw";
import type { Ticket } from "../types/ticket";

const mockTickets: Ticket[] = [
  {
    id: 1,
    title: "May in khong hoat dong",
    priority: "high",
    status: "open",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Khong vao duoc VPN",
    priority: "urgent",
    status: "in_progress",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

export const handlers = [http.get("*/tickets", () => HttpResponse.json(mockTickets))];
