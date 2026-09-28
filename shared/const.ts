export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
export const CURRENCY_STORAGE_KEY = "app_currency";
export const DEFAULT_CURRENCY = "USD";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Utilities",
  "Health",
  "Other",
] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  "Food": "🍔",
  "Transport": "🚗",
  "Entertainment": "🎬",
  "Utilities": "💡",
  "Health": "🏥",
  "Other": "📦",
};

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
] as const;
