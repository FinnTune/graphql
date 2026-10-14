export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: Record<string, string>; output: Record<string, string>; }
};

export type Country = {
  area: Scalars['Float']['output'];
  capital?: Maybe<Array<Scalars['String']['output']>>;
  ccn3?: Maybe<Scalars['String']['output']>;
  flags?: Maybe<Flags>;
  independent?: Maybe<Scalars['Boolean']['output']>;
  languages?: Maybe<Scalars['JSON']['output']>;
  name: CountryName;
  population: Scalars['Float']['output'];
  region: Scalars['String']['output'];
  subregion?: Maybe<Scalars['String']['output']>;
  timezones?: Maybe<Array<Scalars['String']['output']>>;
};

export type CountryName = {
  common: Scalars['String']['output'];
};

export type CountrySort =
  | 'DENSITY'
  | 'NAME'
  | 'POPULATION';

export type Flags = {
  png?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  /**
   * Countries with valid population/area/region data. All arguments are
   * optional; results default to population-descending.
   */
  countries: Array<Country>;
  /** Per-region country counts and total population, most populous first. */
  regionStats: Array<RegionStats>;
  /** Sorted list of region names present in the data. */
  regions: Array<Scalars['String']['output']>;
};


export type QueryCountriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<CountrySort>;
};

export type RegionStats = {
  countries: Scalars['Int']['output'];
  population: Scalars['Float']['output'];
  region: Scalars['String']['output'];
};
