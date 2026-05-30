import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { WidgetShell } from '../components/widgetShell';
import { WIDGET_REGISTRY } from '../registry/widgetRegistry';

const meta: Meta<typeof WidgetShell> = {
  title: 'Dashboard/WidgetShell',
  component: WidgetShell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WidgetShell>;

export const DefaultState: Story = {
  args: {
    instance: { id: 'w-01', widgetId: 'W01', layout: { x: 0, y: 0, w: 4, h: 4, i: 'w-01' }, config: {} },
    definition: WIDGET_REGISTRY.W01,
    isLoading: false,
    isStale: false,
    lastUpdated: new Date(),
    error: null,
    refetch: () => console.log('Refetching...'),
    children: (
      <div className="flex items-center justify-center h-48 bg-bg-primary text-text-primary border border-border-primary rounded">
        Mock Portfolio Allocation Contents
      </div>
    ),
  },
};

export const LoadingState: Story = {
  args: {
    ...DefaultState.args,
    isLoading: true,
  },
};

export const StaleState: Story = {
  args: {
    ...DefaultState.args,
    isStale: true,
  },
};

export const ErrorState: Story = {
  args: {
    ...DefaultState.args,
    error: 'WebSocket timeout: Live price feeds interrupted',
  },
};
