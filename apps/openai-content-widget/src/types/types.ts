export type ContentItem = {
  /**
   * @description `openssl rand -hex 6`
   * @example fb6ac9b0b47c
   */
  id: string;
  /**
   * @description foreign key to discrete set of content creators
   **/
  contentCreatorId: string;
  type: 'video';
  name: string;
  /**
   * @description content summary
   * @example opengraph meta description
   **/
  shortDescription: string;
  thumbnailUrl: string;
  /**
   * @description https://arbitrary-domain-name.com/filename.mp4
   **/
  mediaUrl: string;
  /**
   * @description transcript of the video
   **/
  transcriptUrl: string;
  /**
   * long-form content about the video (e.g., DesiringGod article accompaniment to a "message")
   * @see https://www.desiringgod.org/messages/creation-sings-through-human-lips
   */
  fullTextUrl: string;
  /**
   * @description response from gloo ai completions api
   * about how to describe the "biblical narrative"
   * of this content item in 280 chars or less
   */
  biblicalNarrative: string;
};
