export async function searchCountries(query, signal) {
  const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,cca3,flags,capital,region`, { signal })
  if (!response.ok) throw new Error(response.status === 404 ? 'No matching countries found.' : 'The country service is temporarily unavailable.')
  const data = await response.json()
  return Array.isArray(data) ? data : []
}
