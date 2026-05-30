import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { W13_SystemStatus } from '../widgets/W13_SystemStatus';
import { generateHoldings, generateSummary } from '../data/mockDataGenerator';

const meta: Meta<typeof W13_SystemStatus> = {
  title: 'Widgets/W13_SystemStatus',
  component: W13_SystemStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof W13_SystemStatus>;

const mockSummary = generateSummary(generateHoldings());

export const DeveloperSimulatorConsole: Story = {
  args: {
    instanceId: 'inst-w13-system',
    config: {},
    data: mockSummary,
    isStale: false,
    lastUpdated: new Date(),
    refetch: () => console.log('Refetching System Metrics...'),
  },
  decorators: [
    (Story) => (
      <div className="w-[450px] h-[320px] p-4 bg-bg-secondary border border-border-primary rounded-lg">
        <Story />
      </div>
    ),
  ],
};
