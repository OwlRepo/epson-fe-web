// Utility to check if a value matches a filter (single or multiple values)
export default function matchesFilter(itemValue: string, filterValue?: string) {
  if (!filterValue) return true;
  const filterValues = filterValue.split(",").map((v) => v.trim());
  return filterValues.includes(itemValue);
}
