import React from 'react';
import { Widget } from '../types';
import { ClockWidget } from './ClockWidget';
import { QuickNotesWidget } from './QuickNotesWidget';
import { ServiceStatusWidget } from './ServiceStatusWidget';
import { SystemInfoWidget } from './SystemInfoWidget';
import { LinksSectionWidget } from './LinksSectionWidget';

interface WidgetRendererProps {
  widget: Widget;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  if (!widget.enabled) return null;

  switch (widget.type) {
    case 'clock':
      return <ClockWidget showSeconds={widget.config?.showSeconds} />;
    case 'quickNotes':
      return <QuickNotesWidget title={widget.title} icon={widget.icon} />;
    case 'serviceStatus':
      return <ServiceStatusWidget title={widget.title} icon={widget.icon} />;
    case 'systemInfo':
      return <SystemInfoWidget title={widget.title} icon={widget.icon} />;
    case 'linksSection':
      return <LinksSectionWidget title={widget.title} icon={widget.icon} />;
    default:
      return null;
  }
}

