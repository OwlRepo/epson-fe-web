// Converts an object to query string while skipping undefined/null
export const objToParams = (obj: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
};
