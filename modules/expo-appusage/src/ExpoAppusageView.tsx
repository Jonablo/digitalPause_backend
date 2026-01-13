import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoAppusageViewProps } from './ExpoAppusage.types';

const NativeView: React.ComponentType<ExpoAppusageViewProps> =
  requireNativeView('ExpoAppusage');

export default function ExpoAppusageView(props: ExpoAppusageViewProps) {
  return <NativeView {...props} />;
}
