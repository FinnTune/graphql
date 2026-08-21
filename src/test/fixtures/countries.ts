import type { Country } from '@/lib/country-data'

export const japan: Country = {
  name: { common: 'Japan' },
  population: 125_000_000,
  area: 377_975,
  region: 'Asia',
  subregion: 'Eastern Asia',
  capital: ['Tokyo'],
  flags: { png: 'https://example.com/jp.png' },
  timezones: ['UTC+09:00'],
  languages: { jpn: 'Japanese' },
  independent: true,
  ccn3: '392',
}

export const monaco: Country = {
  name: { common: 'Monaco' },
  population: 39_000,
  area: 2.02,
  region: 'Europe',
  subregion: 'Western Europe',
  capital: ['Monaco'],
  flags: { png: 'https://example.com/mc.png' },
  timezones: ['UTC+01:00'],
  languages: { fra: 'French' },
  independent: true,
  ccn3: '492',
}

export const unitedStates: Country = {
  name: { common: 'United States' },
  population: 331_000_000,
  area: 9_833_517,
  region: 'Americas',
  subregion: 'North America',
  capital: ['Washington, D.C.'],
  flags: { png: 'https://example.com/us.png' },
  timezones: ['UTC-05:00'],
  languages: { eng: 'English' },
  independent: true,
  ccn3: '840',
}

export const india: Country = {
  name: { common: 'India' },
  population: 1_400_000_000,
  area: 3_287_263,
  region: 'Asia',
  subregion: 'Southern Asia',
  capital: ['New Delhi'],
  flags: { png: 'https://example.com/in.png' },
  timezones: ['UTC+05:30'],
  languages: { hin: 'Hindi', eng: 'English' },
  independent: true,
  ccn3: '356',
}

export const brazil: Country = {
  name: { common: 'Brazil' },
  population: 213_000_000,
  area: 8_515_767,
  region: 'Americas',
  subregion: 'South America',
  capital: ['Brasília'],
  independent: true,
  ccn3: '076',
}

export const invalidCountry: Country = {
  name: { common: '' },
  population: 0,
  area: 0,
  region: '',
}

export const sampleCountries: Country[] = [
  japan,
  monaco,
  unitedStates,
  india,
  brazil,
  invalidCountry,
]
