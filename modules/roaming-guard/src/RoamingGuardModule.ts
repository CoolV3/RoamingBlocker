import { NativeModule, requireNativeModule } from "expo";

declare class RoamingGuardModule extends NativeModule<{}> {
  getAllowedCountries(): Promise<string[]>;
  addCountry(countryCode: string): Promise<void>;
  removeCountry(countryCode: string): Promise<void>;
  isCountryAllowed(countryCode: string): Promise<boolean>;
}

export default requireNativeModule<RoamingGuardModule>("RoamingGuard");