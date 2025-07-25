export default function formatCountWithCommas(count: string | number) {
  let numericCount: number;

  // Convert string to number if necessary
  if (typeof count === "string") {
    numericCount = parseFloat(count);
    // Handle cases where the string might not be a valid number
    if (isNaN(numericCount)) {
      return "Invalid Number"; // Or throw an error, depending on desired behavior
    }
  } else {
    numericCount = count;
  }

  // Use toLocaleString for comma formatting
  return numericCount.toLocaleString();
}
