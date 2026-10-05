import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";

const onboardingKey = "roamingguard.ui.onboardingCompleted"

export default function Index() {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(false)




  useEffect(() => {
    const loadOnboardingStatus = async() => {
      const onboarding = await AsyncStorage.getItem(onboardingKey)
      setOnboardingCompleted(onboarding == "true")
    }
    void loadOnboardingStatus()
  }, []);

  if (onboardingCompleted === null) {
    return null
  }

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/homepage"/>;
  }
  return <Redirect href="/onboarding/welcome"/>


}

