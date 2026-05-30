import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { W01_PortfolioAllocation } from '../widgets/W01_PortfolioAllocation';
import { generateHoldings } from '../data/mockDataGenerator';

const meta: Meta<typeof W01_PortfolioAllocation> = {
  title: 'Widgets/W01_PortfolioAllocation',
  component: W01_PortfolioAllocation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof W01_PortfolioAllocation>;

const mockHoldings = generateHoldings();

export const SectorDonutChart: Story = {
  args: {
    instanceId: 'inst-w01-sector',
    config: {
      dimension: 'sector',
      style: 'donut',
      showLabels: false,
    },
    data: mockHoldings,
    isStale: false,
    lastUpdated: new Date(),
    refetch: () => console.log('Refetching Allocation...'),
  },
  decorators: [
    (Story) => (
      <div className="w-[450px] h-[300px] p-4 bg-bg-secondary border border-border-primary rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const AssetClassPieChart: Story = {
  args: {
    instanceId: 'inst-w01-asset',
    config: {
      dimension: 'assetClass',
      style: 'pie',
      showLabels: false,
    },
    data: mockHoldings,
    isStale: false,
    lastUpdated: new Date(),
    refetch: () => console.log('Refetching Allocation...'),
  },
  decorators: [
    (Story) => (
      <div className="w-[450px] h-[300px] p-4 bg-bg-secondary border border-border-primary rounded-lg">
        <Story />
      </div>
    ),
  ],
};
