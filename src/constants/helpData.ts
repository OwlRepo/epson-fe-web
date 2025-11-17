import { APP_VERSION } from "./appVersion";

export interface ContactInfo {
  name: string;
  position: string;
  contactNumber: string;
  picture?: string | null;
}

export interface HelpData {
  verifyiVersion: string;
  elidAddress: string;
  elidEmailAddress: string;
  elidOfficeContactNumber: string;
  elidLogo?: string | null;
  internationalContacts: ContactInfo[];
  systemSupportContacts: ContactInfo[];
}

export const helpData: HelpData = {
  verifyiVersion: APP_VERSION,
  elidAddress: "2601 N. Domingo St., Brgy. San Antonio, Mandaluyong City",
  elidEmailAddress: "info@elid.com",
  elidOfficeContactNumber: "02-8528-0000",
  elidLogo: null,
  internationalContacts: [
    {
      name: "Troy Mendoza",
      position: "Account Manager",
      contactNumber: "0917-7312212",
      picture: null,
    },
    {
      name: "Edward Tolentino",
      position: "Project Manager",
      contactNumber: "0917-8208779",
      picture: null,
    },
    {
      name: "Joel Hernandez",
      position: "Project Engr",
      contactNumber: "0929-6769674",
      picture: null,
    },
    {
      name: "Warren Cereno",
      position: "MIS Head",
      contactNumber: "0917-1745010",
      picture: null,
    },
  ],
  systemSupportContacts: [
    {
      name: "Rolando Reluya",
      position: "Systems Specialist",
      contactNumber: "0916-3304742",
      picture: null,
    },
    {
      name: "Cayle Manlapaz",
      position: "Systems Specialist",
      contactNumber: "0976-3961035",
      picture: null,
    },
    {
      name: "Paul Abungan",
      position: "System and Hardware Specialist",
      contactNumber: "0966-3505819",
      picture: null,
    },
    {
      name: "Maricon Bitana",
      position: "Aftersales support",
      contactNumber: "0915-5945656",
      picture: null,
    },
  ],
};
