import { Address } from "../../domain/medical/address";
import {
  getCoordinatesFromLocation,
  makeLocationClient,
} from "@metriport/core/external/aws/location";
import { Config } from "../../shared/config";
import { Coordinates } from "@metriport/core/external/aws/location";

/**
 * Geocodes a list of addresses using Amazon Location Services.
 * @param addresses
 * @returns
 */
export async function geocodeAddresses(addresses: Address[]): Promise<Coordinates[]> {
  const indexName = Config.getPlaceIndexName();
  const awsRegion = Config.getAWSRegion();
  const client = makeLocationClient(awsRegion);

  const resultPromises = await Promise.allSettled(
    addresses.map(async address => {
      const addressText = `${address.addressLine1}, ${address.city}, ${address.state} ${address.zip}`;
      const countryFilter = address.country ?? "USA";

      const params = {
        Text: addressText,
        MaxResults: 1,
        Language: "en",
        FilterCountries: [countryFilter],
        IndexName: indexName,
      };

      const locationResponse = await client.searchPlaceIndexForText(params).promise();
      return getCoordinatesFromLocation({ result: locationResponse });
    })
  );
  const successful = resultPromises.flatMap(p => (p.status === "fulfilled" ? p.value : []));
  return successful;
}