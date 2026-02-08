import { APP_VERSION } from "./appVersion";
import { ELID_LOGO, TROY_MENDOZA } from "@/assets/images/team";
import { EDWARD_TOLENTINO } from "@/assets/images/team";
import { JOEL_HERNANDEZ } from "@/assets/images/team";
import { WARREN_CERENO } from "@/assets/images/team";
import { ROLANDO_RELUYA } from "@/assets/images/team";
import { CAYLE_MANLAPAZ } from "@/assets/images/team";
import { PAUL_ABUNGAN } from "@/assets/images/team";
import { MARICON_BITANA } from "@/assets/images/team";

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
  elidLogo: string;
  internationalContacts: ContactInfo[];
  systemSupportContacts: ContactInfo[];
}

export const helpData: HelpData = {
  verifyiVersion: APP_VERSION,
  elidAddress:
    "1404 Annapolis Wilshire Plaza Building, 11 Annapolis St., Greenhills, San Juan, Metro Manila, Philippines",
  elidEmailAddress: "info@elid.com",
  elidOfficeContactNumber: "02-8528-0000",
  elidLogo: ELID_LOGO,
  internationalContacts: [
    {
      name: "Troy Mendoza",
      position: "Business Development Manager (BDM)",
      contactNumber: "0917-7312212",
      picture: TROY_MENDOZA,
    },
    {
      name: "Edward Tolentino",
      position: "Project Manager",
      contactNumber: "0917-8208779",
      picture: EDWARD_TOLENTINO,
    },
    {
      name: "Joel Hernandez",
      position: "Project Engr",
      contactNumber: "0929-6769674",
      picture: JOEL_HERNANDEZ,
    },
    {
      name: "Warren Cereno",
      position: "MIS Head",
      contactNumber: "0917-1745010",
      picture: WARREN_CERENO,
    },
  ],
  systemSupportContacts: [
    {
      name: "Cayle Manlapaz",
      position: "Systems Specialist",
      contactNumber: "0976-3961035",
      picture: CAYLE_MANLAPAZ,
    },
    {
      name: "Paul Abungan",
      position: "System and Hardware Specialist",
      contactNumber: "0966-3505819",
      picture: PAUL_ABUNGAN,
    },
    {
      name: "Maricon Bitana",
      position: "Aftersales support",
      contactNumber: "0915-5945656",
      picture: MARICON_BITANA,
    },
  ],
};
