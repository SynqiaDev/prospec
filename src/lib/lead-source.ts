export const LEAD_SOURCE_VALUES = [
  "manual",
  "campaign",
  "google_maps",
  "website",
  "indication",
  "other",
] as const;

export type LeadSource = (typeof LEAD_SOURCE_VALUES)[number];

export const leadSourceLabels: Record<LeadSource, string> = {
  manual: "Manual",
  campaign: "Campanha",
  google_maps: "Google Maps",
  website: "Website",
  indication: "Indicação",
  other: "Outro",
};

export const LEAD_SOURCE_OPTIONS: { value: LeadSource; label: string }[] = LEAD_SOURCE_VALUES.map(
  (value) => ({
    value,
    label: leadSourceLabels[value],
  }),
);

export function getLeadSourceLabel(source: string | null | undefined): string {
  if (!source) {
    return "—";
  }

  return leadSourceLabels[source as LeadSource] ?? source;
}
