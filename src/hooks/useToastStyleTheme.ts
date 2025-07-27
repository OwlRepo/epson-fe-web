export default function useToastStyleTheme() {
  const toastVariant = {
    successStyle: {
      background: "#3EC765",
      border: "1px solid #3EC765",
      color: "#F7FAFF",
    },
    errorStyle: {
      background: "#C73E3E",
      border: "1px solid #C73E3E",
      color: "#F7FAFF",
    },
    infoStyle: {
      background: "#003F98",
      border: "1px solid #003F98",
      color: "#F7FAFF",
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
