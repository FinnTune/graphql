import snapshot from '@/data/countries-snapshot.json'
import { filterValidCountries, type Country } from '@/lib/country-data'

/**
 * Where the GraphQL resolvers get their countries from.
 *
 * This is a bundled snapshot (src/data/countries-snapshot.json, refreshed
 * with `npm run snapshot`) because the keyless REST Countries v3.1 API this
 * project originally used has been shut down. To use a live API instead,
 * replace this function; nothing else depends on where the data comes from.
 */
export async function loadCountries(): Promise<Country[]> {
  return filterValidCountries(snapshot as Country[])
}
