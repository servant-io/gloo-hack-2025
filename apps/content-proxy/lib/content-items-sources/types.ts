import { ContentItem, PublisherId } from '@/lib/content/types';

interface BaseContentItemsSource {
  id: string;
  publisherId: PublisherId;
  name: string;
  url: string;
  autoSync: boolean;
  statusCode: number | null | undefined;
  response: string | null | undefined;
}

export interface CsvTypeContentItemsSource extends BaseContentItemsSource {
  type: 'csv';
  instructions: {
    defaultContentItemType: ContentItem['type'];
    headers: {
      name?: ContentItem['name'] | null | undefined;
      type?: ContentItem['type'] | null | undefined;
      shortDescription?: ContentItem['shortDescription'] | null | undefined;
      thumbnailUrl?: ContentItem['thumbnailUrl'] | null | undefined;
      contentUrl: ContentItem['contentUrl'];
    };
  };
}

export type Rss2ItunesTypeContentItemsSource = BaseContentItemsSource & {
  type: 'rss2-itunes';
  instructions: {};
};

export type ContentItemsSource =
  | CsvTypeContentItemsSource
  | Rss2ItunesTypeContentItemsSource;

export interface SourcedContentItem {
  contentUrl: string;
  type: ContentItem['type'];
  name?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
}
