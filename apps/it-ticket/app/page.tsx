import { Button } from "@archetype/shared";
import { TicketList } from "@/modules/it-ticket";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-16">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">IT Ticket</h1>
        <Button variant="primary" size="md">
          Tao ticket moi
        </Button>
      </div>
      <TicketList />
    </main>
  );
}
