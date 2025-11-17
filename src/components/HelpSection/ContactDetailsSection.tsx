import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactCard } from "@/components/ui/contact-card";
import { helpData } from "@/constants/helpData";

export function ContactDetailsSection() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-10 flex justify-between items-center gap-4">
        <div className="flex justify-end">
          <div className="w-[350px] rounded-lg flex items-center justify-center">
            {helpData.elidLogo ? (
              <img
                src={helpData.elidLogo}
                alt="ELID Logo"
                className="w-full h-full object-contain rounded-lg p-2"
              />
            ) : (
              <span className="text-gray-400 text-sm text-center px-2">
                ELID LOGO
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* International Contact Details */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
            Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {helpData.internationalContacts.map((contact, index) => (
              <ContactCard
                key={`international-${index}`}
                name={contact.name}
                position={contact.position}
                contactNumber={contact.contactNumber}
                picture={contact.picture}
              />
            ))}
          </div>
        </div>

        {/* System Support */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
            SYSTEM SUPPORT
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {helpData.systemSupportContacts.map((contact, index) => (
              <ContactCard
                key={`support-${index}`}
                name={contact.name}
                position={contact.position}
                contactNumber={contact.contactNumber}
                picture={contact.picture}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
