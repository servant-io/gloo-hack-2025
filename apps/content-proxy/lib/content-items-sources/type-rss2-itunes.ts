import { ContentItem } from '@/lib/content/types';
import XML from 'xml2js';

export const parseRss2Itunes = async (rawRssXmlText: string) => {
  const parser = new XML.Parser({
    attrkey: '$',
    charkey: '_',
    explicitCharkey: false,
    trim: false,
    normalizeTags: false,
    normalize: false,
    explicitRoot: false, // default: true
    emptyTag: '',
    explicitArray: false, // default: true
    ignoreAttrs: false,
    mergeAttrs: false,
    validator: null,
    xmlns: false,
    explicitChildren: false,
    childkey: '$$',
    preserveChildrenOrder: false,
    charsAsChildren: false,
    includeWhiteChars: false,
    async: false,
    strict: true,
    attrNameProcessors: null,
    attrValueProcessors: null,
    tagNameProcessors: null,
    valueProcessors: null,
  });
  const rssxml = await parser.parseStringPromise(rawRssXmlText);

  return rssxml;
};

export const extractContentItemsFromParsedRss2Itunes = (rssxml: {
  channel: {
    item: {
      title: string;
      enclosure: { $: { url: string } };
      'itunes:subtitle': string;
      'itunes:image'?: { $?: { href?: string } };
      // TODO: scrapeable link
      // link: string;
    }[];
  };
}) => {
  return (
    rssxml.channel.item
      // TODO: create a separate resource related to ContentItemsSource that lists
      // all items that were not sourced succesfully
      .filter((item) => typeof item?.enclosure?.$?.url === 'string')
      .map((item) => ({
        name: item.title,
        type: 'audio' as ContentItem['type'],
        // TODO: mimetype
        contentUrl: item?.enclosure?.$?.url,
        shortDescription: item['itunes:subtitle'],
        thumbnailUrl: item['itunes:image']?.$?.href,
      }))
  );
};
