export type DeliveryRate = {
  zone: string;
  city: string;
  area: string;
  charge: number;
  freeThreshold: number | null;
};

function nonNegativeAmount(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function normalizeDeliveryRates(value: unknown): DeliveryRate[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const charge = nonNegativeAmount(row.charge);
    const freeThreshold =
      row.free_threshold === null || row.free_threshold === undefined || row.free_threshold === ""
        ? null
        : nonNegativeAmount(row.free_threshold);

    if (
      typeof row.zone !== "string" ||
      !row.zone.trim() ||
      typeof row.city !== "string" ||
      !row.city.trim() ||
      typeof row.area !== "string" ||
      !row.area.trim() ||
      charge === null ||
      (row.free_threshold !== null &&
        row.free_threshold !== undefined &&
        row.free_threshold !== "" &&
        freeThreshold === null)
    ) {
      return [];
    }

    return [{
      zone: row.zone.trim(),
      city: row.city.trim(),
      area: row.area.trim(),
      charge,
      freeThreshold,
    }];
  });
}

export function uniqueDeliveryCities(rates: DeliveryRate[]) {
  const cities = new Map<string, string>();
  for (const rate of rates) {
    const city = rate.city.trim();
    const normalized = city.toLocaleLowerCase();
    if (city && !cities.has(normalized)) cities.set(normalized, city);
  }
  return [...cities.values()].sort((a, b) => a.localeCompare(b));
}

function normalizeLocation(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function findDeliveryRate(
  rates: DeliveryRate[],
  city: string,
  area: string,
) {
  const normalizedCity = normalizeLocation(city);
  const normalizedArea = normalizeLocation(area);
  return rates.find(
    (rate) =>
      normalizeLocation(rate.city) === normalizedCity &&
      normalizeLocation(rate.area) === normalizedArea,
  ) ?? null;
}

export function findLahoreLocalDeliveryRate(rates: DeliveryRate[]) {
  return rates.find(
    (rate) =>
      normalizeLocation(rate.city) === "lahore" &&
      normalizeLocation(rate.area) === "lahore (all localities)",
  ) ?? null;
}

export function calculateDeliveryCharge(rate: DeliveryRate, subtotal: number) {
  if (
    rate.freeThreshold !== null &&
    subtotal > 0 &&
    subtotal >= rate.freeThreshold
  ) {
    return 0;
  }
  return rate.charge;
}
