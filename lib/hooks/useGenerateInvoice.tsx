const useGenerateInvoice = () => {
  const datePart = new Date().toISOString().split('T')[0].replace(/-/g, ''); // e.g. 20240604
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `INV-${datePart}${randomPart}`;
}

export default useGenerateInvoice;