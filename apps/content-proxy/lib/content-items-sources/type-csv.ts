import { CsvTypeContentItemsSource } from '@/lib/content-items-sources/types';
import { ContentItem } from '@/lib/content/types';
import CSV from 'papaparse';

export const getCsvRows = (csvContent: string): string[][] => {
  const rows = CSV.parse(csvContent, { header: false }).data;
  if (typeof rows === 'object' && typeof rows[0] === 'string')
    return rows as string[][];

  return [];
};

export const getCsvHeaderColumns = (csvContent: string): string[] => {
  return getCsvRows(csvContent)[0] || [];
};

export const extractContentItemsFromParsedCsv = (
  parsedCsv: string[][],
  instructions: CsvTypeContentItemsSource['instructions']
) => {
  const headers = instructions.headers;
  const defaultContentItemType = instructions.defaultContentItemType;
  const indices = {
    contentUrl: parsedCsv[0]?.indexOf(headers.contentUrl),
    ...(headers.name && { name: parsedCsv[0]?.indexOf(headers.name) }),
    ...(headers.type && { type: parsedCsv[0]?.indexOf(headers.type) }),
    ...(headers.shortDescription && {
      shortDescription: parsedCsv[0]?.indexOf(headers.shortDescription),
    }),
    ...(headers.thumbnailUrl && {
      thumbnailUrl: parsedCsv[0]?.indexOf(headers.thumbnailUrl),
    }),
  };

  return parsedCsv.slice(1).map((row) => ({
    contentUrl: row[indices.contentUrl],
    type: (indices.type
      ? row[indices.type]
      : defaultContentItemType) as ContentItem['type'],
    // TODO: mimetype
    ...(indices.name && { name: row[indices.name] }),
    ...(indices.shortDescription && {
      shortDescription: row[indices.shortDescription],
    }),
    ...(indices.thumbnailUrl && { thumbnailUrl: row[indices.thumbnailUrl] }),
  }));
};
