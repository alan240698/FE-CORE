import { Nav } from "./components/Nav";
import { UserStatus } from "./components/UserStatus";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-16">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">
          Archetype Group Intranet
        </h1>
        <UserStatus />
      </div>
      <Nav />
    </main>
  );
}
