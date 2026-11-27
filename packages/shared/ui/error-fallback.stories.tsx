import type { Meta, StoryObj } from "@storybook/react";
import { ErrorFallback } from "./error-fallback";

const meta: Meta<typeof ErrorFallback> = {
  title: "shared/ui/ErrorFallback",
  component: ErrorFallback,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ErrorFallback>;

export const Default: Story = {
  args: {
    title: "Da xay ra loi khong mong muon",
    retryLabel: "Thu lai",
    reset: () => {},
  },
};
