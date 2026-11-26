import { Nav } from "./components/Nav";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-16">
      <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">
        Archetype Group Intranet
      </h1>
      <Nav />
    </main>
  );
}
