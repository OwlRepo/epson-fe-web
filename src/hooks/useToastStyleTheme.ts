export default function useToastStyleTheme() {
  const toastVariant = {
    successStyle: {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      color: "#166534",
    },
    errorStyle: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
    },
    infoStyle: {
      background: "#edf4fc",
      border: "1px solid #004099",
      color: "#004099",
    },
    warningStyle: {
      background: "#fffbeb",
      border: "1px solid #fde68a",
      color: "#854d0e",
    },
  };

  return toastVariant;
}

export enum ToastType {
  SUCCESS_STYLE = `{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
        }`,
  ERROR_STYLE = `{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
        }`,
  INFO_STYLE = `{
            background: "#edf4fc",
            border: "1px solid #004099",
            color: "#004099",
        }`,
  WARNING_STYLE = `{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#854d0e",
        }`,
}
