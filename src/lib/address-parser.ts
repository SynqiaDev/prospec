const BRAZILIAN_STATES = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

const CEP_SEGMENT_REGEX = /^\d{5}-?\d{3}$/;
const CITY_STATE_SEGMENT_REGEX = /^(?<city>.+?)\s*-\s*(?<state>[A-Za-z]{2})$/;
const STATE_ONLY_SEGMENT_REGEX = /^(?<state>[A-Za-z]{2})$/;

export type ParsedAddress = {
  city: string | null;
  state: string | null;
  cityState: string | null;
};

function normalizeAddress(address: string) {
  return address.replace(/\s+/g, " ").trim();
}

function normalizeSegment(segment: string) {
  return segment.replace(/\s+/g, " ").trim();
}

export function parseBrazilAddress(address: string | null | undefined): ParsedAddress {
  if (!address?.trim()) {
    return { city: null, state: null, cityState: null };
  }

  const normalizedAddress = normalizeAddress(address);
  const segments = normalizedAddress
    .split(",")
    .map(normalizeSegment)
    .filter(Boolean);

  if (segments.length < 2) {
    return { city: null, state: null, cityState: null };
  }

  const lastSegment = segments[segments.length - 1];
  const cepIndex = CEP_SEGMENT_REGEX.test(lastSegment) ? segments.length - 1 : -1;
  const cityStateIndex = cepIndex >= 0 ? cepIndex - 1 : segments.length - 1;

  if (cityStateIndex < 0) {
    return { city: null, state: null, cityState: null };
  }

  const cityStateSegment = segments[cityStateIndex];
  const match = cityStateSegment.match(CITY_STATE_SEGMENT_REGEX);
  if (!match?.groups) {
    const stateOnlyMatch = cityStateSegment.match(STATE_ONLY_SEGMENT_REGEX);
    const state = stateOnlyMatch?.groups?.state?.toUpperCase() ?? null;
    if (!state || !BRAZILIAN_STATES.has(state)) {
      return { city: null, state: null, cityState: null };
    }
    return { city: null, state, cityState: state };
  }

  const city = normalizeSegment(match.groups.city);
  const state = match.groups.state.toUpperCase();

  if (!city || !BRAZILIAN_STATES.has(state)) {
    return { city: null, state: null, cityState: null };
  }

  return {
    city,
    state,
    cityState: `${city} - ${state}`,
  };
}
