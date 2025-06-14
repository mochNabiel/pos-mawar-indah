import { TransactionWithId } from "@/types/transaction";

// Fungsi untuk mendapatkan rekap penjualan berdasarkan transaksi
export const getSalesRecap = (transactions: TransactionWithId[]) => {
  let totalTransactions = transactions.length;
  let totalWeight = 0;
  let totalRevenue = 0;

  transactions.forEach((tx) => {
    totalRevenue += tx.totalTransaction;
    totalWeight += tx.cards.reduce(
      (sum, card) => sum + parseFloat(card.weight),
      0
    );
  });

  return {
    transactions: totalTransactions,
    totalFabricSold: parseFloat(totalWeight.toFixed(2)),
    totalRevenue,
  };
};

// Tipe untuk ringkasan pelanggan
type CustomerSummary = {
  name: string;
  totalWeight: number;
  totalTransaction: number;
};

// Fungsi untuk mendapatkan semua pelanggan dan transaksi mereka
export const getTopCustomers = (transactions: TransactionWithId[], customers: any[]) => {
  const summaries: CustomerSummary[] = customers.map((customer) => {
    const customerTransactions = transactions.filter(
      (tx) => tx.customerName === customer.name
    );

    const totalWeight = customerTransactions.reduce((total, tx) => {
      const weightSum =
        tx.cards?.reduce((sum: number, card: any) => {
          return sum + parseFloat(card.weight || "0");
        }, 0) || 0;
      return total + weightSum;
    }, 0);

    const totalTransaction = customerTransactions.reduce(
      (sum, tx) => sum + (tx.totalTransaction || 0),
      0
    );

    return {
      name: customer.name,
      totalWeight,
      totalTransaction,
    };
  });

  return summaries; // Kembalikan semua ringkasan pelanggan
};

// Tipe untuk ringkasan kain
type FabricSummary = {
  fabricName: string;
  totalWeight: number;
};

// Fungsi untuk mendapatkan semua kain terlaris
export const getTopFabrics = (transactions: TransactionWithId[]) => {
  const fabricMap: Record<string, number> = {};

  transactions.forEach((tx) => {
    tx.cards.forEach((card: any) => {
      const name = card.fabricName;
      const weight = parseFloat(card.weight || "0");

      if (!fabricMap[name]) {
        fabricMap[name] = 0;
      }

      fabricMap[name] += weight;
    });
  });

  const fabricSummaries: FabricSummary[] = Object.entries(fabricMap).map(
    ([fabricName, totalWeight]) => ({
      fabricName,
      totalWeight,
    })
  );

  return fabricSummaries; // Kembalikan semua ringkasan kain
};

// Tipe untuk penjualan bulanan
export type MonthlyFabricSales = {
  month: string;
  totalWeight: number;
};

// Fungsi untuk mendapatkan data grafik penjualan bulanan
export const getMonthlySalesChartData = (transactions: TransactionWithId[], year: number) => {
  const monthlyTotals: Record<number, number> = {};

  transactions.forEach((tx) => {
    const month = tx.createdAt.getMonth();
    const weightSum = tx.cards.reduce(
      (sum: number, card: any) => sum + parseFloat(card.weight || "0"),
      0
    );
    if (tx.createdAt.getFullYear() === year) {
      monthlyTotals[month] = (monthlyTotals[month] || 0) + weightSum;
    }
  });

  const result: MonthlyFabricSales[] = [];
  for (let i = 0; i < 12; i++) {
    result.push({
      month: new Date(year, i).toLocaleString("id", { month: "short" }),
      totalWeight: monthlyTotals[i] || 0,
    });
  }

  return result; // Kembalikan hasil penjualan bulanan
};
