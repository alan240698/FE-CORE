// Health check for Docker Swarm - ONLY reports liveness, does NOT call any
// database/API (see trien-khai-docker-swarm-cho-fe.md section 3 - liveness should not
// depend on other systems).
export async function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
