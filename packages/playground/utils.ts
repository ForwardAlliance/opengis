export async function saveToFile({
  obj,
  name,
}: {
  obj: object
  name?: string
}) {
  return await Bun.write(`data/${name}.geojson`, JSON.stringify(obj), {
    createPath: true,
  })
}
