import { NativeModule, requireNativeModule } from "expo";

export type RoamingZone = {
  id: string;
  name: string;
  countries: string[];
};

declare class RoamingGuardModule extends NativeModule<{}> {
  getAllowedCountries(): Promise<string[]>;
  getStandaloneCountries(): Promise<string[]>;
  getSelectedZoneIds(): Promise<string[]>;

  addCountry(countryCode: string): Promise<void>;
  removeCountry(countryCode: string): Promise<void>;
  isCountryAllowed(countryCode: string): Promise<boolean>;

  addZone(zoneId: string): Promise<void>;
  removeZone(zoneId: string): Promise<void>;

  getAvailableZones(): RoamingZone[];

  enableCountryWatching(): Promise<void>;
  disableCountryWatching(): Promise<void>;
  isCountryWatching(): Promise<boolean>;

  isCountryWatchingServiceRunning(): boolean;
  isInternetBlocked(): boolean;
}

export default requireNativeModule<RoamingGuardModule>(
    "RoamingGuard"
);