import { describe, expect, it } from 'vitest'
import {
  buildRegionStats,
  countIndependent,
  countWithLanguageData,
  defaultCompareSelections,
  density,
  filterAndSortCountries,
  filterCountries,
  filterValidCountries,
  findCountryByName,
  formatLanguageList,
  formatNumber,
  getComparisonMaxes,
  getDensestCountry,
  getRegionOptions,
  getSpotlightCountry,
  getTopPopulationCountries,
  isValidCountry,
  matchesCountryQuery,
  matchesRegion,
  normalized,
  populationBarWidth,
  sortCountries,
  sumPopulation,
  resolveCompareSelection,
} from '@/lib/country-data'
import {
  brazil,
  india,
  invalidCountry,
  japan,
  monaco,
  sampleCountries,
  unitedStates,
} from '@/test/fixtures/countries'

describe('resolveCompareSelection', () => {
  const valid = filterValidCountries(sampleCountries)

  it('returns defaults when nothing is selected', () => {
    expect(resolveCompareSelection(valid, '', 'compareA')).toBe('Japan')
    expect(resolveCompareSelection(valid, '', 'compareB')).toBe('Monaco')
  })

  it('keeps a valid user selection', () => {
    expect(resolveCompareSelection(valid, 'India', 'compareA')).toBe('India')
  })

  it('falls back when the selected country is no longer visible', () => {
    const asiaOnly = valid.filter((country) => country.region === 'Asia')
    expect(resolveCompareSelection(asiaOnly, 'Monaco', 'compareA')).toBe('Japan')
  })
})

describe('formatNumber', () => {
  it('formats integers with grouping separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1_400_000_000)).toBe('1,400,000,000')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('density', () => {
  it('calculates population per square kilometer', () => {
    expect(density(monaco)).toBeCloseTo(39_000 / 2.02, 5)
    expect(density(japan)).toBeCloseTo(125_000_000 / 377_975, 5)
  })
})

describe('normalized', () => {
  it('returns percentage of max value', () => {
    expect(normalized(50, 100)).toBe(50)
    expect(normalized(25, 100)).toBe(25)
  })

  it('returns zero when max is zero', () => {
    expect(normalized(100, 0)).toBe(0)
  })
})

describe('populationBarWidth', () => {
  it('enforces a minimum bar width of 8', () => {
    expect(populationBarWidth(1, 1_000_000)).toBe(8)
  })

  it('scales relative to the maximum population', () => {
    expect(populationBarWidth(500, 1000)).toBe(50)
    expect(populationBarWidth(1000, 1000)).toBe(100)
  })
})

describe('isValidCountry', () => {
  it('accepts countries with required positive fields', () => {
    expect(isValidCountry(japan)).toBe(true)
    expect(isValidCountry(monaco)).toBe(true)
  })

  it('rejects incomplete or zero-value countries', () => {
    expect(isValidCountry(invalidCountry)).toBe(false)
    expect(isValidCountry({ ...japan, population: 0 })).toBe(false)
    expect(isValidCountry({ ...japan, area: 0 })).toBe(false)
    expect(isValidCountry({ ...japan, region: '' })).toBe(false)
  })
})

describe('filterValidCountries', () => {
  it('removes invalid entries from API payloads', () => {
    expect(filterValidCountries(sampleCountries)).toEqual([
      japan,
      monaco,
      unitedStates,
      india,
      brazil,
    ])
  })
})

describe('getRegionOptions', () => {
  it('prepends All and lists unique sorted regions', () => {
    const valid = filterValidCountries(sampleCountries)
    expect(getRegionOptions(valid)).toEqual(['All', 'Americas', 'Asia', 'Europe'])
  })
})

describe('buildRegionStats', () => {
  it('aggregates country counts and population by region', () => {
    const stats = buildRegionStats(filterValidCountries(sampleCountries))
    const asia = stats.find((entry) => entry.region === 'Asia')

    expect(asia).toEqual({
      region: 'Asia',
      countries: 2,
      population: japan.population + india.population,
    })
    expect(stats[0].region).toBe('Asia')
    expect(stats[0].population).toBeGreaterThan(stats[1].population)
  })
})

describe('getSpotlightCountry', () => {
  it('returns the densest country in the dataset', () => {
    expect(getSpotlightCountry(filterValidCountries(sampleCountries))?.name.common).toBe('Monaco')
  })

  it('returns null for empty input', () => {
    expect(getSpotlightCountry([])).toBeNull()
  })
})

describe('matchesCountryQuery', () => {
  it('matches country names case-insensitively', () => {
    expect(matchesCountryQuery(japan, 'japan')).toBe(true)
    expect(matchesCountryQuery(japan, 'JAP')).toBe(true)
  })

  it('matches capitals case-insensitively', () => {
    expect(matchesCountryQuery(india, 'delhi')).toBe(true)
    expect(matchesCountryQuery(unitedStates, 'washington')).toBe(true)
  })

  it('returns true for blank queries', () => {
    expect(matchesCountryQuery(japan, '')).toBe(true)
    expect(matchesCountryQuery(japan, '   ')).toBe(true)
  })

  it('returns false when neither name nor capital matches', () => {
    expect(matchesCountryQuery(japan, 'paris')).toBe(false)
  })
})

describe('matchesRegion', () => {
  it('matches all regions when All is selected', () => {
    expect(matchesRegion(japan, 'All')).toBe(true)
    expect(matchesRegion(monaco, 'All')).toBe(true)
  })

  it('matches only the selected region', () => {
    expect(matchesRegion(japan, 'Asia')).toBe(true)
    expect(matchesRegion(japan, 'Europe')).toBe(false)
  })
})

describe('filterCountries', () => {
  it('filters by region and query together', () => {
    const valid = filterValidCountries(sampleCountries)
    expect(filterCountries(valid, 'tokyo', 'Asia').map((c) => c.name.common)).toEqual(['Japan'])
    expect(filterCountries(valid, '', 'Europe').map((c) => c.name.common)).toEqual(['Monaco'])
  })
})

describe('sortCountries', () => {
  const valid = filterValidCountries(sampleCountries)

  it('sorts by population descending', () => {
    expect(sortCountries(valid, 'population').map((c) => c.name.common)).toEqual([
      'India',
      'United States',
      'Brazil',
      'Japan',
      'Monaco',
    ])
  })

  it('sorts by density descending', () => {
    expect(sortCountries(valid, 'density')[0].name.common).toBe('Monaco')
  })

  it('sorts alphabetically by name', () => {
    expect(sortCountries(valid, 'name').map((c) => c.name.common)).toEqual([
      'Brazil',
      'India',
      'Japan',
      'Monaco',
      'United States',
    ])
  })
})

describe('filterAndSortCountries', () => {
  it('applies filtering before sorting', () => {
    const result = filterAndSortCountries(sampleCountries, '', 'Asia', 'name')
    expect(result.map((country) => country.name.common)).toEqual(['India', 'Japan'])
  })
})

describe('getTopPopulationCountries', () => {
  it('returns the requested number of leaders', () => {
    const topTwo = getTopPopulationCountries(filterValidCountries(sampleCountries), 2)
    expect(topTwo.map((country) => country.name.common)).toEqual(['India', 'United States'])
  })

  it('defaults to eight results', () => {
    expect(getTopPopulationCountries(filterValidCountries(sampleCountries))).toHaveLength(5)
  })
})

describe('sumPopulation', () => {
  it('totals population across countries', () => {
    expect(sumPopulation([japan, monaco])).toBe(japan.population + monaco.population)
  })

  it('returns zero for empty arrays', () => {
    expect(sumPopulation([])).toBe(0)
  })
})

describe('countIndependent', () => {
  it('counts independent countries only', () => {
    const mixed = [
      japan,
      { ...brazil, independent: false },
    ]
    expect(countIndependent(mixed)).toBe(1)
  })
})

describe('countWithLanguageData', () => {
  it('counts countries with at least one language entry', () => {
    expect(countWithLanguageData(filterValidCountries(sampleCountries))).toBe(4)
    expect(countWithLanguageData([brazil])).toBe(0)
  })
})

describe('getDensestCountry', () => {
  it('returns the densest country in a filtered set', () => {
    expect(getDensestCountry([japan, monaco, unitedStates])?.name.common).toBe('Monaco')
  })
})

describe('findCountryByName', () => {
  it('finds a country by common name', () => {
    expect(findCountryByName(sampleCountries, 'Japan')).toEqual(japan)
  })

  it('returns null when not found', () => {
    expect(findCountryByName(sampleCountries, 'Narnia')).toBeNull()
  })
})

describe('getComparisonMaxes', () => {
  it('returns the max population, area, and density between two countries', () => {
    expect(getComparisonMaxes(japan, monaco)).toEqual({
      population: japan.population,
      area: japan.area,
      density: density(monaco),
    })
  })

  it('handles null countries', () => {
    expect(getComparisonMaxes(null, null)).toEqual({
      population: 0,
      area: 0,
      density: 0,
    })
  })
})

describe('formatLanguageList', () => {
  it('joins up to three language names', () => {
    expect(formatLanguageList(india.languages)).toBe('Hindi, English')
  })

  it('returns Unknown when languages are missing', () => {
    expect(formatLanguageList(undefined)).toBe('Unknown')
  })
})

describe('defaultCompareSelections', () => {
  it('selects the first two visible countries', () => {
    expect(defaultCompareSelections([japan, monaco, unitedStates])).toEqual({
      compareA: 'Japan',
      compareB: 'Monaco',
    })
  })

  it('falls back to the first country when only one is visible', () => {
    expect(defaultCompareSelections([japan])).toEqual({
      compareA: 'Japan',
      compareB: 'Japan',
    })
  })

  it('returns empty strings when no countries are visible', () => {
    expect(defaultCompareSelections([])).toEqual({
      compareA: '',
      compareB: '',
    })
  })
})
