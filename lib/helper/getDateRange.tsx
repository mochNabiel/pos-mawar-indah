import { Timestamp } from "firebase/firestore";

export const getDateRange = (
  type: "daily" | "weekly" | "monthly",
  date = new Date()
) => {
  let startDate: Date;
  let endDate: Date;

  if (type === "daily") {
    startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
  } else if (type === "weekly") {
    startDate = new Date(date);
    startDate.setDate(date.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  return {
    start: Timestamp.fromDate(startDate),
    end: Timestamp.fromDate(endDate),
    startDate,
    endDate,
  };
};
