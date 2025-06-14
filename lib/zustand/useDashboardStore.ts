import { create } from "zustand";
import { TransactionWithId } from "@/types/transaction";
import { getAllTransactions } from "@/lib/firestore/dashboard";
import { getDateRange } from "@/lib/helper/getDateRange";

interface DashboardState {
  transactions: TransactionWithId[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  getSalesRecap: (
    type: "daily" | "weekly" | "monthly",
    month?: string | null,
    year?: string | null
  ) => {
    transactions: number;
    totalFabricSold: number;
    totalRevenue: number;
  };
  getMonthlySalesChartData: (
    year?: string | null
  ) => { month: string; totalWeight: number }[];
  getFabricsRecap: (
    month?: string | null,
    year?: string | null
  ) => { fabricName: string; totalWeight: number }[];
  getCustomersRecap: (
    month?: string | null,
    year?: string | null
  ) => {
    byWeight: { name: string; totalWeight: number; totalTransaction: number }[];
    byTransaction: { name: string; totalWeight: number; totalTransaction: number }[];
  };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const transactions = await getAllTransactions();
      set({ transactions });
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      set({ loading: false });
    }
  },

  getSalesRecap: (type, month, year) => {
    const date =
      month && year ? new Date(parseInt(year), parseInt(month) - 1) : new Date();
    const { start, end } = getDateRange(type, date);

    const transactions = get().transactions;

    let totalTransactions = 0;
    let totalWeight = 0;
    let totalRevenue = 0;

    transactions.forEach((tx) => {
      if (tx.createdAt >= start.toDate() && tx.createdAt <= end.toDate()) {
        totalTransactions += 1;
        totalRevenue += tx.totalTransaction;
        totalWeight += tx.cards.reduce(
          (sum, card) => sum + parseFloat(card.weight || "0"),
          0
        );
      }
    });

    return {
      transactions: totalTransactions,
      totalFabricSold: parseFloat(totalWeight.toFixed(2)),
      totalRevenue,
    };
  },

  getMonthlySalesChartData: (year) => {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const transactions = get().transactions;

    const monthlyTotals: Record<number, number> = {};

    transactions.forEach((t) => {
      const txYear = t.createdAt.getFullYear();
      if (txYear === targetYear) {
        const month = t.createdAt.getMonth();
        const weightSum = t.cards.reduce(
          (sum, card) => sum + parseFloat(card.weight || "0"),
          0
        );
        monthlyTotals[month] = (monthlyTotals[month] || 0) + weightSum;
      }
    });

    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(targetYear, i).toLocaleString("id", { month: "short" }),
      totalWeight: monthlyTotals[i] || 0,
    }));
  },

  getFabricsRecap: (month, year) => {
    const date =
      month && year ? new Date(parseInt(year), parseInt(month) - 1) : new Date();
    const { start, end } = getDateRange("monthly", date);
    const transactions = get().transactions;

    const allCards = transactions
      .filter(
        (tx) => tx.createdAt >= start.toDate() && tx.createdAt <= end.toDate()
      )
      .flatMap((tx) => tx.cards || []);

    const fabricMap: Record<string, number> = {};

    allCards.forEach((card: any) => {
      const name = card.fabricName;
      const weight = parseFloat(card.weight || "0");

      if (!fabricMap[name]) {
        fabricMap[name] = 0;
      }

      fabricMap[name] += weight;
    });

    return Object.entries(fabricMap)
      .map(([fabricName, totalWeight]) => ({
        fabricName,
        totalWeight,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight); // Sort by totalWeight descending
  },

  getCustomersRecap: (month, year) => {
    const date =
      month && year ? new Date(parseInt(year), parseInt(month) - 1) : new Date();
    const { start, end } = getDateRange("monthly", date);
    const transactions = get().transactions;

    const customerMap: Record<
      string,
      { totalWeight: number; totalTransaction: number }
    > = {};

    transactions.forEach((tx) => {
      if (tx.createdAt >= start.toDate() && tx.createdAt <= end.toDate()) {
        const customerName = tx.customerName;
        const weightSum = tx.cards.reduce((sum: number, card: any) => {
          return sum + parseFloat(card.weight || "0");
        }, 0);

        if (!customerMap[customerName]) {
          customerMap[customerName] = { totalWeight: 0, totalTransaction: 0 };
        }

        customerMap[customerName].totalWeight += weightSum;
        customerMap[customerName].totalTransaction += tx.totalTransaction || 0;
      }
    });

    const customersArray = Object.entries(customerMap).map(
      ([name, { totalWeight, totalTransaction }]) => ({
        name,
        totalWeight,
        totalTransaction,
      })
    );

    // Sort customers by totalWeight and totalTransaction
    const byWeight = customersArray.sort((a, b) => b.totalWeight - a.totalWeight);
    const byTransaction = customersArray.sort((a, b) => b.totalTransaction - a.totalTransaction);

    return {
      byWeight,
      byTransaction,
    };
  },
}));
