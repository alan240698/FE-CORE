import { TicketList } from "@/modules/it-ticket";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-16">
      <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">IT Ticket</h1>
      <TicketList />
    </main>
  );
}
