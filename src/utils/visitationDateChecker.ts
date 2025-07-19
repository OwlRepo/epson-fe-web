import { isBefore, startOfDay } from "date-fns";

const daysBeforeExpiration = 3; // days before expiration to show warning

export const visitationDateChecker = (dateTo: any) => {
  const expireSoon =
    dateTo &&
    new Date(dateTo).getTime() - new Date().getTime() <=
      daysBeforeExpiration * 24 * 60 * 60 * 1000;
  const isExpired =
    dateTo && isBefore(startOfDay(new Date(dateTo)), startOfDay(new Date()));

  return {
    expireSoon,
    isExpired,
  };
};
