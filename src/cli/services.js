import { SERVICE_PROVIDERS } from "../modules/services";

const mapProviderToName = (provider) => {
  // Webpack mangles the class names to include their parent package e.g.
  // IndyCar becomes indycar_IndyCar; we want the actual class name.
  // Package alone does not uniquely identify a service (see `aco`)!
  const fullName = provider.name;
  const underscoreIndex = fullName.lastIndexOf('_');
  if (underscoreIndex >= 0) {
    return fullName.slice(underscoreIndex + 1);
  }
  return fullName;
};

export const Services = Object.fromEntries(
  SERVICE_PROVIDERS.map(s => [mapProviderToName(s), s])
);
