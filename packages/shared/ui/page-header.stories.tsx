import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { PageHeader } from "./page-header";

const meta: Meta<typeof PageHeader> = {
  title: "shared/ui/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const WithAction: Story = {
  args: {
    title: "IT Ticket",
    action: <Button variant="primary">Tao yeu cau moi</Button>,
  },
};

export const TitleOnly: Story = {
  args: {
    title: "IT Ticket",
  },
};
