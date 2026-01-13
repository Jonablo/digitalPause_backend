import * as React from 'react';

import { ExpoAppusageViewProps } from './ExpoAppusage.types';

export default function ExpoAppusageView(props: ExpoAppusageViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
