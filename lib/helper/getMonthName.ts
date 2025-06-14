const getMonthName = (month: string | null) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agt",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ]
  return month ? monthNames[parseInt(month) - 1] : ""
}

export default getMonthName
