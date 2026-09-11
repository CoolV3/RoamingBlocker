import { registerWebModule, NativeModule } from 'expo';

// RoamingGuardModule is not available on the web platform.
class RoamingGuardModule extends NativeModule<{}> {}

export default registerWebModule(RoamingGuardModule, 'RoamingGuardModule');
