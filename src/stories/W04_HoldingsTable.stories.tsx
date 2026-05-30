import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { W04_HoldingsTable } from '../widgets/W04_HoldingsTable';
import { generateHoldings } from '../data/mockDataGenerator';

const meta: Meta<typeof W04_HoldingsTable> = {
  title: 'Widgets/W04_HoldingsTable',
  component: W04_HoldingsTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof W04_HoldingsTable>;

const mockHoldings = generateHoldings();

export const DefaultHoldingsTable: Story = {
  args: {
    instanceId: 'inst-w04-table',
    config: {
      assetClass: 'all',
      rowsPerPage: 10,
    },
    data: mockHoldings,
    isStale: false,
    lastUpdated: new Date(),
    refetch: () => console.log('Refetching Holdings...'),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl h-[450px] p-4 bg-bg-secondary border border-border-primary rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const DerivativesOnlyTable: Story = {
  args: {
    instanceId: 'inst-w04-table-deriv',
    config: {
      assetClass: 'Derivative',
      rowsPerPage: 5,
    },
    data: mockHoldings,
    isStale: false,
    lastUpdated: new Date(),
    refetch: () => console.log('Refetching Derivatives...'),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl h-[300px] p-4 bg-bg-secondary border border-border-primary rounded-lg">
        <Story />
      </div>
    ),
  ],
};
