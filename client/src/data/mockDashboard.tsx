

export type BankKey = "Chase" | "Bank of America" | "Capital One" | "Discover";

export type CategorySpend = {
  category: string;
  value: number; 
};

export type DailySpend = {
  date: string;      
  Chase: number;
  "Bank of America": number;
  "Capital One": number;
  Discover: number;
};


export const MOCK_CATEGORY_SPEND: CategorySpend[] = [
  { category: "Dining", value: 620 },
  { category: "Groceries", value: 480 },
  { category: "Travel", value: 830 },
  { category: "Gas", value: 260 },
  { category: "Online Shopping", value: 390 },
];

export const MOCK_DAILY_SPEND: DailySpend[] = [
  { date: "Mon", Chase: 80, "Bank of America": 60, "Capital One": 40, Discover: 20 },
  { date: "Tue", Chase: 120, "Bank of America": 50, "Capital One": 70, Discover: 30 },
  { date: "Wed", Chase: 90, "Bank of America": 110, "Capital One": 60, Discover: 40 },
  { date: "Thu", Chase: 140, "Bank of America": 80, "Capital One": 50, Discover: 35 },
  { date: "Fri", Chase: 200, "Bank of America": 130, "Capital One": 90, Discover: 60 },
  { date: "Sat", Chase: 170, "Bank of America": 120, "Capital One": 110, Discover: 50 },
  { date: "Sun", Chase: 150, "Bank of America": 90, "Capital One": 80, Discover: 45 },
];

export const MOCK_BEST_CARDS = [
  { category: "Dining", cardName: "Chase Sapphire Preferred", bank: "Chase" },
  { category: "Groceries", cardName: "Bank of America Customized Cash", bank: "Bank of America" },
  { category: "Travel", cardName: "Capital One Venture", bank: "Capital One" },
  { category: "Gas", cardName: "Discover it Chrome", bank: "Discover" },
];
