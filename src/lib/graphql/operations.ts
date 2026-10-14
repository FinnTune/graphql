/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type CountrySort =
  | 'DENSITY'
  | 'NAME'
  | 'POPULATION';

export type CountryFieldsFragment = { population: number, area: number, region: string, subregion: string | null, capital: Array<string> | null, timezones: Array<string> | null, languages: Record<string, string> | null, independent: boolean | null, ccn3: string | null, name: { common: string }, flags: { png: string | null } | null };

export type ExplorerQueryVariables = Exact<{
  search?: string | null | undefined;
  region?: string | null | undefined;
  sortBy?: CountrySort | null | undefined;
}>;


export type ExplorerQuery = { regions: Array<string>, countries: Array<{ population: number, area: number, region: string, subregion: string | null, capital: Array<string> | null, timezones: Array<string> | null, languages: Record<string, string> | null, independent: boolean | null, ccn3: string | null, name: { common: string }, flags: { png: string | null } | null }>, regionStats: Array<{ region: string, countries: number, population: number }>, densest: Array<{ population: number, area: number, region: string, subregion: string | null, capital: Array<string> | null, timezones: Array<string> | null, languages: Record<string, string> | null, independent: boolean | null, ccn3: string | null, name: { common: string }, flags: { png: string | null } | null }> };
