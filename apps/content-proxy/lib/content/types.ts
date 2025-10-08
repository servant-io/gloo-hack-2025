export const PublisherIds = {
  ACU: 'e1d05990811c',
  IWU: 'dffa5eca5ccc',
  BETHEL_TECH: '88c7702ddabb',
  APPLE: '7403c2c2c373',
  CAREY_NIEUWHOF: '21991dbb36be',
} as const;

export type PublisherId = (typeof PublisherIds)[keyof typeof PublisherIds];

export type ContentItem = {
  id: string;
  publisherId: PublisherId;
  type: 'article' | 'video' | 'audio';
  name: string | null;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  contentUrl: string;
};

export type Publisher = {
  id: PublisherId;
  name: string;
};

export type ContentItemWithPublisher = ContentItem & {
  publisher: Publisher;
};
