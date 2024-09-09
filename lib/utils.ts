import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import configEnv from "@/config"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${configEnv.app.url || "http://localhost:3000"
    }${path}`;
}

export function anonymizeConfigEnvValues(configEnv: any) {
  const urlRegex = /^(http|https|postgresql):\/\/[^\s/$.?#].[^\s]*$/i;

  function anonymizeValue(value: any): any {
    if (typeof value === 'string') {
      if (value.includes('...') || value.trim() === '') {
        return value;
      } else if (urlRegex.test(value)) {
        if (value.length > 50) {
          return `${value.slice(0, 20)}...${value.slice(-20)}`;
        }
        return value;
      } else {
        return `${value.slice(0, 3)}...${value.slice(-3)}`;
      }
    } else if (typeof value === 'object' && value !== null) {
      const anonymizedObject: any = {};
      for (const key in value) {
        anonymizedObject[key] = anonymizeValue(value[key]);
      }
      return anonymizedObject;
    }
    return value;
  }

  return anonymizeValue(configEnv);
}
