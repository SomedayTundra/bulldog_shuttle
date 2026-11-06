import { listCities } from './_lib/jefferson.js'

export async function GET() {
  try {
    const cities = await listCities()
    return Response.json(cities, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 })
  }
}
