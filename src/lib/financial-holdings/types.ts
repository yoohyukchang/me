export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  price: number;
  categoryId: string;
  updatedAt: string;
  order: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  netContribution: number;
  portfolioValue: number;
}
