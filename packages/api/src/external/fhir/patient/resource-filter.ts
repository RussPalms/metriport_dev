import { ResourceType } from "@medplum/fhirtypes";
import {
  resourcesSearchableByPatient,
  resourcesSearchableBySubject,
  ResourceTypeForConsolidation,
} from "@metriport/api-sdk";
import { intersection } from "lodash";
import { isoDateRangeToFHIRDateQuery, resourceSupportsDateQuery } from "../shared";

export function getPatientFilter({
  resources = [],
  dateFrom,
  dateTo,
}: {
  resources?: ResourceTypeForConsolidation[];
  dateFrom?: string;
  dateTo?: string;
}) {
  const resourcesByPatient =
    resources && resources.length
      ? intersection(resources, resourcesSearchableByPatient)
      : resourcesSearchableByPatient;
  const resourcesBySubject =
    resources && resources.length
      ? intersection(resources, resourcesSearchableBySubject)
      : resourcesSearchableBySubject;

  const fhirDateFilter = isoDateRangeToFHIRDateQuery(dateFrom, dateTo);
  const dateFilter = fhirDateFilter ? `&${fhirDateFilter}` : "";

  return {
    resourcesByPatient,
    resourcesBySubject,
    dateFilter,
  };
}

export function fullDateQueryForResource(fullDateQuery: string, resource: ResourceType): string {
  return resourceSupportsDateQuery(resource) ? fullDateQuery : "";
}