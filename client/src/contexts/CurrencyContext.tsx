import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CURRENCY, CURRENCY_STORAGE_KEY } from "@shared/const";
import { convertFromBaseAmount, convertToBaseAmount as convertInputToBaseAmount } from "@shared/currency";

type Currency = "USD" | "INR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getSymbol: () => string;
  convertAmount: (amount: number) => number;
  convertToBaseAmount: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY as Currency);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
    if (saved && (saved === "USD" || saved === "INR")) {
      setCurrencyState(saved);
    }
    setMounted(true);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  const getSymbol = () => {
    return currency === "USD" ? "$" : "₹";
  };

  const convertAmount = (amount: number) => {
    // Amount is always stored in USD in database
    // Only convert for display if viewing in INR
    return convertFromBaseAmount(amount, currency);
  };

  const convertToBaseAmount = (amount: number) => {
    // When user inputs in INR, convert to USD for storage
    return convertInputToBaseAmount(amount, currency);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getSymbol, convertAmount, convertToBaseAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
