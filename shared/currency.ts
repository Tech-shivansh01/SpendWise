export const EXCHANGE_RATE = 83;

/** Convert a stored USD base amount to the selected display currency. */
export function convertFromBaseAmount(amount: number, currency: "USD" | "INR"): number {
  return currency === "INR" ? amount * EXCHANGE_RATE : amount;
}

/** Convert user-entered currency to the USD base amount stored in the database. */
export function convertToBaseAmount(amount: number, currency: "USD" | "INR"): number {
  return currency === "INR" ? amount / EXCHANGE_RATE : amount;
}
