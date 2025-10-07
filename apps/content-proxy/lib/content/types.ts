export const PublisherIds = {
  ACU: 'e1d05990811c',
  IWU: 'dffa5eca5ccc',
  BETHEL_TECH: '88c7702ddabb',
  APPLE: '7403c2c2c373',
} as const;

export type PublisherId = (typeof PublisherIds)[keyof typeof PublisherIds];

export type ContentItem = {
  id: string;
  publisherId: PublisherId;
  type: 'article' | 'video' | 'audio';
  name: string;
  shortDescription: string;
  thumbnailUrl: string;
  contentUrl: string;
};

export type Publisher = {
  id: PublisherId;
  name: string;
};

export type ContentItemWithPublisher = ContentItem & {
  publisher: Publisher;
};
