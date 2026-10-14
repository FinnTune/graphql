import Image from 'next/image'
import { density, formatLanguageList, formatNumber, type Country } from '@/lib/country-data'

type CountryDetailsProps = {
  country: Country
  variant: 'map' | 'spotlight'
}

export default function CountryDetails({ country, variant }: CountryDetailsProps) {
  const capital = country.capital?.[0] ?? 'Unknown'
  const densityText = `${density(country).toFixed(1)} people/km2`

  return (
    <div className="flex gap-4">
      {country.flags?.png ? (
        <Image
          src={country.flags.png}
          alt={`${country.name.common} flag`}
          className="h-16 w-24 rounded object-cover"
          width={96}
          height={64}
          unoptimized
        />
      ) : null}
      <div className="text-sm">
        <p className="text-lg font-semibold">{country.name.common}</p>
        <p>Region: {country.region}</p>
        {variant === 'spotlight' ? <p>Subregion: {country.subregion ?? 'Unknown'}</p> : null}
        <p>Capital: {capital}</p>
        {variant === 'map' ? <p>Population: {formatNumber(country.population)}</p> : null}
        <p>Density: {densityText}</p>
        {variant === 'map' ? (
          <p>Languages: {formatLanguageList(country.languages)}</p>
        ) : (
          <p>Timezone: {country.timezones?.[0] ?? 'Unknown'}</p>
        )}
      </div>
    </div>
  )
}
