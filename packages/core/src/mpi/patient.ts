import { USState } from "../domain/geographic-locations";
import { Patient as FHIRPatient, ContactPoint } from "@medplum/fhirtypes";

// TODO whole file should be migrated into mirth replacement module once we pass verification with testing partners.

export type LivingSubjectId = {
  extension?: string;
  root?: string;
};

export type PrincipalCareProviderId = {
  extension?: string;
  root?: string;
};

export const generalTypes = ["passport", "ssn", "medicare"] as const;
export const driversLicenseType = ["driversLicense"] as const;
export type GeneralTypes = (typeof generalTypes)[number];
export type DriverLicenseType = (typeof driversLicenseType)[number];

export type Period =
  | {
      start: string;
      end?: string;
    }
  | {
      start?: string;
      end: string;
    };

export type BaseIdentifier = {
  period?: Period;
  assigner?: string;
};

export type PersonalIdentifier = BaseIdentifier & {
  type: DriverLicenseType;
  value: string;
  state: USState;
};

export type DriversLicense = {
  value: string;
  state: USState;
};

export const genderAtBirthTypes = ["F", "M"] as const;
export type GenderAtBirth = (typeof genderAtBirthTypes)[number];

export type Address = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: USState;
  zip: string;
  country?: string;
};

export type ContactTypes = "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";

export type Contact = Partial<Record<ContactTypes, string | undefined>>;

// modify address schema to have type of AddressLine2 be string? instead of string | undefined

export type PatientDataMPI = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  genderAtBirth: GenderAtBirth;
  personalIdentifiers?: PersonalIdentifier[] | null;
  address?: Address[];
  contact?: Contact[];
  // TODO do something with these
  livingSubjectId?: LivingSubjectId;
  principalCareProviderId?: PrincipalCareProviderId;
  // TODO remove these.
  systemId?: string;
  documentId?: string;
};

export function convertPatientToFHIR(patient: PatientDataMPI): FHIRPatient {
  const fhirPatient: FHIRPatient = {
    resourceType: "Patient",
    id: patient.id,
    name: [
      {
        family: patient.lastName,
        given: patient.firstName ? [patient.firstName] : [],
      },
    ],
    birthDate: patient.dob,
    gender: patient.genderAtBirth === "M" ? "male" : "female",
    address:
      patient.address?.map((addr: Address) => {
        return {
          line: addr.addressLine1 ? [addr.addressLine1] : [],
          city: addr.city,
          state: addr.state,
          postalCode: addr.zip,
          country: addr.country || "USA",
        };
      }) || [],
    telecom:
      patient.contact
        ?.map((contact: Contact) => {
          const telecoms: ContactPoint[] = [];
          for (const type in contact) {
            if (isContactType(type) && contact[type]) {
              const contactValue = contact[type];
              if (contactValue) {
                const contactPoint: ContactPoint = {
                  system: type,
                  value: contactValue,
                };
                telecoms.push(contactPoint);
              }
            }
          }
          return telecoms; // Moved return statement outside of the for loop
        })
        .reduce((prev, curr) => prev.concat(curr), []) || [],
  };

  return fhirPatient;
}

export function isContactType(type: string): type is ContactTypes {
  return ["phone", "fax", "email", "pager", "url", "sms", "other"].includes(type);
}