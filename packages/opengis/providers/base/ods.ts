import { unzipSync } from 'fflate'
import { SaxesParser } from 'saxes'

// ODS empty rows/cells carry huge `number-columns/rows-repeated` counts as
// trailing filler. Never expand a blank cell past this — otherwise a single
// filler cell would balloon a row to tens of thousands of entries.
const MAX_BLANK_REPEAT = 64

const CELL_TAGS = new Set(['table:table-cell', 'table:covered-table-cell'])

/**
 * Fetch an OpenDocument Spreadsheet (`.ods`) and return its rows as flat
 * `{ header: value }` records (first row = header).
 *
 * ODS is a zip of XML; we unzip `content.xml` and stream it with a SAX parser
 * (the file can be tens of MB uncompressed, so a full DOM is avoided). Cells are
 * walked in order with `number-columns-repeated` expanded so blank cells keep
 * columns aligned; trailing filler cells/rows are dropped.
 */
export async function fetchOdsRecords(
  url: string,
  { sheet = 0 }: { sheet?: number } = {},
): Promise<Record<string, string>[]> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ODS from ${url}: ${response.status}`)
  }

  const files = unzipSync(new Uint8Array(await response.arrayBuffer()))
  const content = files['content.xml']
  if (!content) {
    throw new Error(`ODS at ${url} has no content.xml`)
  }
  const text = new TextDecoder('utf-8').decode(content)

  const records: Record<string, string>[] = []
  let header: string[] | null = null

  let tableIndex = -1
  let inSheet = false
  let cells: string[] = []
  let rowActive = false
  let rowPadding = false
  let cellText = ''
  let cellRepeat = 1
  let inCell = false

  const parser = new SaxesParser()

  parser.on('opentag', (tag) => {
    const attrs = tag.attributes as Record<string, string>
    if (tag.name === 'table:table') {
      tableIndex += 1
      inSheet = tableIndex === sheet
      return
    }
    if (!inSheet) {
      return
    }
    if (tag.name === 'table:table-row') {
      cells = []
      rowActive = true
      rowPadding = false
      return
    }
    if (rowActive && !rowPadding && CELL_TAGS.has(tag.name)) {
      inCell = true
      cellText = ''
      cellRepeat = Number(attrs['table:number-columns-repeated'] ?? '1') || 1
    }
  })

  parser.on('text', (value) => {
    if (inCell) {
      cellText += value
    }
  })

  parser.on('closetag', (tag) => {
    if (!inSheet) {
      return
    }
    if (CELL_TAGS.has(tag.name) && inCell) {
      inCell = false
      const trimmed = cellText.trim()
      if (trimmed === '' && cellRepeat > MAX_BLANK_REPEAT) {
        // Trailing blank filler — ignore this and the rest of the row.
        rowPadding = true
        return
      }
      for (let i = 0; i < cellRepeat; i++) {
        cells.push(trimmed)
      }
      return
    }
    if (tag.name === 'table:table-row' && rowActive) {
      rowActive = false
      if (cells.some((c) => c !== '')) {
        if (!header) {
          header = cells
        } else {
          const record: Record<string, string> = {}
          header.forEach((key, i) => {
            record[key] = cells[i] ?? ''
          })
          records.push(record)
        }
      }
    }
  })

  parser.write(text).close()
  return records
}
