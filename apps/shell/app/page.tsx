import { PageHeader } from "@archetype/shared";
import { Nav } from "./components/Nav";
import { UserStatus } from "./components/UserStatus";
import { vi } from "./messages/vi";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6 sm:p-10 lg:p-16">
      <PageHeader title={vi.heading} action={<UserStatus />} />
      <Nav />
    </main>
  );
}
