import { searchTrips } from './_lib/jefferson.js'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const from = params.get('from')
  const to = params.get('to')
  const date = params.get('date')
  if (!from || !to || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: 'Expected ?from=City|ST&to=City|ST&date=YYYY-MM-DD' },
      { status: 400 },
    )
  }
  try {
    const result = await searchTrips(from, to, date)
    return Response.json(result, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 })
  }
}
