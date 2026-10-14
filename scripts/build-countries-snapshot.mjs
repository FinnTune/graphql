// Regenerates src/data/countries-snapshot.json. Run with `npm run snapshot`.
//
// Sources (all keyless):
//   - mledoze/countries (ODbL): names, codes, region, capital, area, languages
//   - World Bank SP.POP.TOTL (CC BY 4.0): most recent total population
//   - countries-and-timezones (MIT): IANA zones, converted to UTC offsets
//   - flagcdn.com: flag images, addressed by ISO 3166-1 alpha-2 code
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { getCountry } = require('countries-and-timezones')

const COUNTRIES_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
const POPULATION_URL =
  'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&mrv=1&per_page=400'

// Territories the World Bank has no figure for (approximate, rounded
// estimates), so they still appear on the map and in rankings.
const POPULATION_OVERRIDES = {
  TWN: 23_400_000,
  VAT: 800,
  ESH: 600_000,
  FLK: 3_500,
  NFK: 2_200,
  NIU: 1_700,
  COK: 17_000,
  TKL: 1_900,
  SHN: 5_700,
  SJM: 2_900,
  BVT: 1,
  UMI: 300,
  ATF: 150,
  HMD: 1,
  PCN: 47,
  CCK: 600,
  CXR: 1_900,
  GGY: 64_000,
  JEY: 103_000,
  IMN: 84_000,
  ALA: 30_000,
  BLM: 10_000,
  SPM: 5_800,
  WLF: 11_500,
  MSR: 4_400,
  AIA: 15_700,
  SGS: 30,
  IOT: 3_000,
  ATA: 1_000,
  MAF: 32_000,
  BES: 26_000,
  TLS: 1_360_000,
  GUF: 295_000,
  GLP: 395_000,
  MTQ: 360_000,
  MYT: 335_000,
  REU: 870_000,
  UNK: 1_760_000, // Kosovo
}

const REFERENCE_DATE = new Date('2025-01-15T12:00:00Z')

function utcOffset(timeZone) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(REFERENCE_DATE)
    .find((entry) => entry.type === 'timeZoneName')?.value
  if (!part || part === 'GMT') return 'UTC+00:00'
  return part.replace('GMT', 'UTC')
}

function timezonesFor(cca2) {
  const zones = getCountry(cca2)?.timezones ?? []
  return [...new Set(zones.map(utcOffset))]
}

async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`)
  return response.json()
}

const [countries, [, populationRows]] = await Promise.all([
  getJson(COUNTRIES_URL),
  getJson(POPULATION_URL),
])

const populationByIso3 = new Map(
  populationRows.filter((row) => row.value != null).map((row) => [row.countryiso3code, row.value])
)

const snapshot = countries
  .map((country) => {
    const population = populationByIso3.get(country.cca3) ?? POPULATION_OVERRIDES[country.cca3] ?? 0
    const timezones = timezonesFor(country.cca2)

    return {
      name: { common: country.name.common },
      population,
      area: country.area,
      region: country.region,
      ...(country.subregion ? { subregion: country.subregion } : {}),
      ...(country.capital?.length ? { capital: country.capital } : {}),
      flags: { png: `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png` },
      ...(timezones.length ? { timezones } : {}),
      ...(country.languages && Object.keys(country.languages).length
        ? { languages: country.languages }
        : {}),
      independent: country.independent,
      ccn3: country.ccn3,
    }
  })
  .sort((a, b) => a.name.common.localeCompare(b.name.common))

await writeFile(
  new URL('../src/data/countries-snapshot.json', import.meta.url),
  `${JSON.stringify(snapshot)}\n`
)

const withoutPopulation = snapshot.filter((country) => !country.population)
console.log(`Wrote ${snapshot.length} countries.`)
if (withoutPopulation.length) {
  console.log(`No population for: ${withoutPopulation.map((country) => country.name.common).join(', ')}`)
}
