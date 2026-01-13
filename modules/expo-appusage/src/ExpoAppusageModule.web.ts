import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoAppusage.types';

type ExpoAppusageModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoAppusageModule extends NativeModule<ExpoAppusageModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoAppusageModule, 'ExpoAppusageModule');
