import type { Meta, StoryObj } from "@storybook/react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "./table";

const meta: Meta<typeof Table> = {
  title: "shared/ui/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const TicketListExample: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Printer not working</TableCell>
          <TableCell>High</TableCell>
          <TableCell>Open</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Cannot access VPN</TableCell>
          <TableCell>Urgent</TableCell>
          <TableCell>In progress</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
