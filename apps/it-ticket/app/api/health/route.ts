// Health check cho Docker Swarm - CHI bao song, KHONG goi database/API khac (xem
// trien-khai-docker-swarm-cho-fe.md muc 3 - liveness khong nen phu thuoc he thong khac).
export async function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
