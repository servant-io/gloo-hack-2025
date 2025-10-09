import { PublisherIds } from '../../lib/content/types';
import { db } from '../db';
import {
  publishers,
  contentItems,
  contentItemsSources,
} from '../schemas/content';
import { eq } from 'drizzle-orm';

export async function seedContentSchemas() {
  await seedPublishers();
  await seedContentItemsSources();
  await seedContentItems();
}

type Publisher = typeof publishers.$inferInsert;

async function seedPublishers() {
  console.log('Seeding publishers...');
  let insertedCount = 0;
  let updatedCount = 0;

  for (const publisher of seededPublishers) {
    // Check if publisher already exists
    const existingPublisher = await db
      .select()
      .from(publishers)
      .where(eq(publishers.id, publisher.id))
      .limit(1);

    if (existingPublisher.length === 0) {
      // Publisher doesn't exist, insert it
      await db.insert(publishers).values(publisher as Publisher);
      insertedCount++;
    } else {
      // Publisher exists, check if we need to update
      const currentPublisher = existingPublisher[0];
      if (currentPublisher.name !== publisher.name) {
        // Update the publisher if name changed
        await db
          .update(publishers)
          .set({
            name: publisher.name,
            updatedAt: new Date(),
          })
          .where(eq(publishers.id, publisher.id));
        updatedCount++;
      }
    }
  }
  console.log(
    `Upserted publishers: ${insertedCount} inserted, ${updatedCount} updated, ${seededPublishers.length - insertedCount - updatedCount} unchanged`
  );
}

type ContentItemsSource = typeof contentItemsSources.$inferInsert;

async function seedContentItemsSources() {
  console.log('Seeding content item sources...');
  let insertedCount = 0;
  let updatedCount = 0;

  for (const contentItemsSource of seededContentItemsSources) {
    // Check if content items source already exists
    const existingContentItemsSource = await db
      .select()
      .from(contentItemsSources)
      .where(eq(contentItemsSources.id, contentItemsSource.id))
      .limit(1);

    if (existingContentItemsSource.length === 0) {
      // Content items source doesn't exist, insert it
      await db
        .insert(contentItemsSources)
        .values(contentItemsSource as ContentItemsSource);
      insertedCount++;
    } else {
      // Content item exists, check if we need to update
      const currentContentItemsSource = existingContentItemsSource[0];
      const needsUpdate =
        currentContentItemsSource.publisherId !==
          contentItemsSource.publisherId ||
        currentContentItemsSource.type !== contentItemsSource.type ||
        currentContentItemsSource.name !== contentItemsSource.name ||
        currentContentItemsSource.url !== contentItemsSource.url ||
        currentContentItemsSource.autoSync !== contentItemsSource.autoSync ||
        JSON.stringify(currentContentItemsSource.data) !==
          JSON.stringify(contentItemsSource.data);

      if (needsUpdate) {
        // Update the content items source if any field changed
        await db
          .update(contentItemsSources)
          .set({
            publisherId: contentItemsSource.publisherId,
            type: contentItemsSource.type,
            name: contentItemsSource.name,
            url: contentItemsSource.url,
            autoSync: contentItemsSource.autoSync,
            instructions: contentItemsSource.instructions,
            updatedAt: new Date(),
          })
          .where(eq(contentItemsSources.id, contentItemsSource.id));
        updatedCount++;
      }
    }
  }
  console.log(
    `Upserted content items sources: ${insertedCount} inserted, ${updatedCount} updated, ${seededContentItemsSources.length - insertedCount - updatedCount} unchanged`
  );
}

type ContentItem = typeof contentItems.$inferInsert;

async function seedContentItems() {
  console.log('Seeding content items...');
  let insertedCount = 0;
  let updatedCount = 0;

  for (const contentItem of seededContentItems) {
    // Check if content item already exists
    const existingContentItem = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, contentItem.id))
      .limit(1);

    if (existingContentItem.length === 0) {
      // Content item doesn't exist, insert it
      await db.insert(contentItems).values(contentItem as ContentItem);
      insertedCount++;
    } else {
      // Content item exists, check if we need to update
      const currentContentItem = existingContentItem[0];
      const needsUpdate =
        currentContentItem.publisherId !== contentItem.publisherId ||
        currentContentItem.type !== contentItem.type ||
        currentContentItem.name !== contentItem.name ||
        currentContentItem.shortDescription !== contentItem.shortDescription ||
        currentContentItem.thumbnailUrl !== contentItem.thumbnailUrl ||
        currentContentItem.contentUrl !== contentItem.contentUrl;

      if (needsUpdate) {
        // Update the content item if any field changed
        await db
          .update(contentItems)
          .set({
            publisherId: contentItem.publisherId,
            type: contentItem.type,
            name: contentItem.name,
            shortDescription: contentItem.shortDescription,
            thumbnailUrl: contentItem.thumbnailUrl,
            contentUrl: contentItem.contentUrl,
            updatedAt: new Date(),
          })
          .where(eq(contentItems.id, contentItem.id));
        updatedCount++;
      }
    }
  }
  console.log(
    `Upserted content items: ${insertedCount} inserted, ${updatedCount} updated, ${seededContentItems.length - insertedCount - updatedCount} unchanged`
  );
}

const seededContentItemsSources: ContentItemsSource[] = [
  {
    id: 'eb5f44e9946e',
    publisherId: PublisherIds.CAREY_NIEUWHOF,
    type: 'csv',
    name: 'Google Sheet CSV Export of "The Carey Nieuwhof Leadership Podcast"',
    // browser url: https://docs.google.com/spreadsheets/d/1IvkuEbxWkdWHOsQkj6WyjjD5LJ_TqxvJA61MfqrAQLg/edit?usp=sharing
    url: 'https://docs.google.com/spreadsheets/d/1IvkuEbxWkdWHOsQkj6WyjjD5LJ_TqxvJA61MfqrAQLg/export?format=csv&gid=0',
    autoSync: false,
    instructions: {
      defaultContentItemType: 'audio',
      headers: {
        name: 'title',
        shortDescription: null,
        thumbnailUrl: 'image',
        contentUrl: 'audio_url',
      },
    },
  },
  {
    id: '54d67f958769',
    publisherId: PublisherIds.CAREY_NIEUWHOF,
    type: 'rss2-itunes',
    name: 'RSS feed from libsyn.com of "The Carey Nieuwhof Leadership Podcast"',
    url: 'https://feeds.libsyn.com/41469/rss',
    autoSync: false,
    instructions: {},
  },
];

const seededContentItems: ContentItem[] = [
  {
    id: '72f20c838bb0',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Introduction to Biblical Theology',
    shortDescription:
      "Explore the grand narrative of Scripture and discover how God's redemptive plan unfolds from Genesis to Revelation.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=11',
    contentUrl: 'https://christianed.com/courses/biblical-theology',
  },
  {
    id: '9d12fa6e1c84',
    publisherId: PublisherIds.IWU,
    type: 'video',
    name: 'Advanced Systematic Theology',
    shortDescription:
      'A comprehensive study of Christian doctrine including the Trinity, Christology, and eschatology.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=12',
    contentUrl: 'https://christianed.com/courses/systematic-theology',
  },
  {
    id: '43e1d7b2a6f3',
    publisherId: PublisherIds.ACU,
    type: 'audio',
    name: 'Church History: Early Christianity',
    shortDescription:
      'Journey through the first five centuries of Christianity, from the apostolic age to the Council of Chalcedon.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=13',
    contentUrl: 'https://christianed.com/courses/church-history',
  },
  {
    id: 'b6e7c9f43821',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: 'Christian Apologetics in the Modern World',
    shortDescription:
      'Learn to defend the Christian faith with reason, evidence, and grace in contemporary contexts.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=14',
    contentUrl: 'https://christianed.com/courses/apologetics',
  },
  {
    id: 'f1840d7a53bc',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'Pastoral Leadership and Care',
    shortDescription:
      'Develop essential skills for pastoral ministry including preaching, counseling, and church administration.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=15',
    contentUrl: 'https://christianed.com/courses/pastoral-leadership',
  },
  {
    id: '2a9b6fe5c713',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'Worship and Liturgy Through the Ages',
    shortDescription:
      'Explore the rich tradition of Christian worship from ancient liturgies to contemporary expressions.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=16',
    contentUrl: 'https://christianed.com/courses/worship-liturgy',
  },
  {
    id: '5cf0e48b9d12',
    publisherId: PublisherIds.BETHEL_TECH,
    type: 'article',
    name: 'AI Engineering for Kingdom Impact',
    shortDescription:
      "Learn artificial intelligence and machine learning principles while exploring how technology can serve God's kingdom.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=17',
    contentUrl: 'https://christianed.com/courses/ai-engineering',
  },
  {
    id: '8be4d3920a6f',
    publisherId: PublisherIds.BETHEL_TECH,
    type: 'video',
    name: 'Full-Stack Web Development for Ministry',
    shortDescription:
      'Build modern web applications using React, Node.js, and databases while creating tools that serve the church.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=18',
    contentUrl: 'https://christianed.com/courses/web-development',
  },
  {
    id: 'c71d5f9aeb02',
    publisherId: PublisherIds.BETHEL_TECH,
    type: 'audio',
    name: 'Database Fundamentals for Church Management',
    shortDescription:
      'Master SQL and database design principles while learning to build systems that help churches manage resources.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=19',
    contentUrl: 'https://christianed.com/courses/database-fundamentals',
  },
  {
    id: 'e9f302d6c7a1',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Biblical Hermeneutics and Exegesis',
    shortDescription:
      'Learn proper methods for interpreting Scripture and applying biblical principles to contemporary life.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=20',
    contentUrl: 'https://christianed.com/courses/hermeneutics',
  },
  {
    id: 'a23f45b9cd12',
    publisherId: PublisherIds.IWU,
    type: 'video',
    name: 'The Prophets: Voices of Truth',
    shortDescription:
      "Examine the messages of the Old Testament prophets and their relevance for today's world.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=21',
    contentUrl: 'https://christianed.com/courses/prophets',
  },
  {
    id: 'b78e91f2a456',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Pauline Epistles: Letters of Grace',
    shortDescription:
      "Study Paul's letters to early churches, unpacking themes of grace, faith, and perseverance.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=22',
    contentUrl: 'https://christianed.com/courses/pauline-epistles',
  },
  {
    id: 'c34d12a7e981',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'Psalms: Prayers of the Heart',
    shortDescription:
      "Engage with the Psalms as Israel's prayer book, learning how they shape Christian worship and devotion.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=23',
    contentUrl: 'https://christianed.com/courses/psalms',
  },
  {
    id: 'd56a71e4b2f9',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'The Gospels: Life of Christ',
    shortDescription:
      "Discover the four gospel accounts, their unique perspectives, and how they testify to Jesus' life and mission.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=24',
    contentUrl: 'https://christianed.com/courses/gospels',
  },
  {
    id: 'e81c59a2f6d3',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: 'Acts: The Early Church in Motion',
    shortDescription:
      "Follow the spread of the gospel through the book of Acts, highlighting the Spirit's work in the early church.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=25',
    contentUrl: 'https://christianed.com/courses/acts',
  },
  {
    id: 'f92d07b5c8a4',
    publisherId: PublisherIds.ACU,
    type: 'audio',
    name: 'Revelation: Hope for the End Times',
    shortDescription:
      'Understand the imagery and themes of Revelation as a message of hope and victory in Christ.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=26',
    contentUrl: 'https://christianed.com/courses/revelation',
  },
  {
    id: '1a2b3c4d5e6f',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: 'Ethics in Christian Life',
    shortDescription:
      'Explore biblical foundations for morality and how Christians live faithfully in complex times.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=27',
    contentUrl: 'https://christianed.com/courses/ethics',
  },
  {
    id: '2b3c4d5e6f7a',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'Spiritual Disciplines for Growth',
    shortDescription:
      'Learn the classic spiritual disciplines that draw believers closer to God and shape Christlike character.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=28',
    contentUrl: 'https://christianed.com/courses/spiritual-disciplines',
  },
  {
    id: '3c4d5e6f7a8b',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'Christian Counseling Foundations',
    shortDescription:
      "Understand the principles of Christian counseling and how to walk with others through life's challenges.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=29',
    contentUrl: 'https://christianed.com/courses/christian-counseling',
  },
  {
    id: '4d5e6f7a8b9c',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Church Planting Essentials',
    shortDescription:
      'Gain practical and biblical insights for starting and sustaining new churches in diverse contexts.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=30',
    contentUrl: 'https://christianed.com/courses/church-planting',
  },
  {
    id: '5e6f7a8b9c0d',
    publisherId: PublisherIds.IWU,
    type: 'video',
    name: "Missiology: God's Heart for the Nations",
    shortDescription:
      'Explore the biblical basis of missions and learn strategies for engaging in global evangelism.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=31',
    contentUrl: 'https://christianed.com/courses/missiology',
  },
  {
    id: '6f7a8b9c0d1e',
    publisherId: PublisherIds.ACU,
    type: 'audio',
    name: 'History of Christian Doctrine',
    shortDescription:
      'Trace the development of key doctrines throughout church history and their importance today.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=32',
    contentUrl: 'https://christianed.com/courses/christian-doctrine-history',
  },
  {
    id: '7a8b9c0d1e2f',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: 'Old Testament Survey',
    shortDescription:
      "Get an overview of the books of the Old Testament, their themes, and their role in God's plan.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=33',
    contentUrl: 'https://christianed.com/courses/ot-survey',
  },
  {
    id: '8b9c0d1e2f3a',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'New Testament Survey',
    shortDescription:
      'Study the books of the New Testament, their contexts, and their message of salvation in Christ.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=34',
    contentUrl: 'https://christianed.com/courses/nt-survey',
  },
  {
    id: '9c0d1e2f3a4b',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'Great Hymns of the Faith',
    shortDescription:
      'Discover the stories behind beloved Christian hymns and their role in shaping worship.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=35',
    contentUrl: 'https://christianed.com/courses/hymns',
  },
  {
    id: '0d1e2f3a4b5c',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Theology of Work',
    shortDescription:
      'Understand how faith informs vocation and how Christians can glorify God in the workplace.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=36',
    contentUrl: 'https://christianed.com/courses/theology-of-work',
  },
  {
    id: '1e2f3a4b5c6d',
    publisherId: PublisherIds.IWU,
    type: 'video',
    name: 'Christian Leadership in Business',
    shortDescription:
      'Learn principles of servant leadership and how to integrate faith in business contexts.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=37',
    contentUrl: 'https://christianed.com/courses/leadership-business',
  },
  {
    id: '2f3a4b5c6d7e',
    publisherId: PublisherIds.ACU,
    type: 'audio',
    name: 'Christian Art and Creativity',
    shortDescription:
      'Celebrate the intersection of faith and creativity through art, music, and storytelling.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=38',
    contentUrl: 'https://christianed.com/courses/christian-art',
  },
  {
    id: '3a4b5c6d7e8f',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: 'Faith and Science Dialogue',
    shortDescription:
      'Examine how science and faith interact, addressing challenges and opportunities for dialogue.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=39',
    contentUrl: 'https://christianed.com/courses/faith-science',
  },
  {
    id: '4b5c6d7e8f9a',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'Christianity and Culture',
    shortDescription:
      'Study how Christianity has influenced and been influenced by cultural movements throughout history.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=40',
    contentUrl: 'https://christianed.com/courses/christianity-culture',
  },
  {
    id: '5c6d7e8f9a0b',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'The Desert Fathers and Mothers',
    shortDescription:
      'Learn about early Christian monastics whose writings and lives shaped spiritual practices.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=41',
    contentUrl: 'https://christianed.com/courses/desert-fathers',
  },
  {
    id: '6d7e8f9a0b1c',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Christian Hospitality',
    shortDescription:
      'Understand the biblical mandate for hospitality and its transformative power in community.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=42',
    contentUrl: 'https://christianed.com/courses/hospitality',
  },
  {
    id: '7e8f9a0b1c2d',
    publisherId: PublisherIds.IWU,
    type: 'video',
    name: 'Christian Parenting',
    shortDescription:
      'Gain wisdom for raising children in the faith with biblical principles and practical tools.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=43',
    contentUrl: 'https://christianed.com/courses/parenting',
  },
  {
    id: '8f9a0b1c2d3e',
    publisherId: PublisherIds.ACU,
    type: 'audio',
    name: 'Marriage and the Gospel',
    shortDescription:
      "Explore God's design for marriage and how it reflects Christ's love for the church.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=44',
    contentUrl: 'https://christianed.com/courses/marriage',
  },
  {
    id: '9a0b1c2d3e4f',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: 'Prayer and Intercession',
    shortDescription:
      'Deepen your understanding of prayer as communion with God and intercession for others.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=45',
    contentUrl: 'https://christianed.com/courses/prayer',
  },
  {
    id: '0b1c2d3e4f5a',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'Christian Evangelism Today',
    shortDescription:
      'Learn effective and compassionate ways to share the gospel in diverse modern contexts.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=46',
    contentUrl: 'https://christianed.com/courses/evangelism',
  },
  {
    id: '1c2d3e4f5a6b',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'Christian Justice and Mercy',
    shortDescription:
      'Examine biblical teaching on justice and mercy and how believers live them out in society.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=47',
    contentUrl: 'https://christianed.com/courses/justice-mercy',
  },
  {
    id: '2d3e4f5a6b7c',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Christian Stewardship',
    shortDescription:
      "Learn biblical principles for managing money, time, and talents for God's glory.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=48',
    contentUrl: 'https://christianed.com/courses/stewardship',
  },
  {
    id: '3e4f5a6b7c8d',
    publisherId: PublisherIds.IWU,
    type: 'video',
    name: 'Holy Spirit: Comforter and Guide',
    shortDescription:
      "Study the person and work of the Holy Spirit and His role in the believer's life.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=49',
    contentUrl: 'https://christianed.com/courses/holy-spirit',
  },
  {
    id: '4f5a6b7c8d9e',
    publisherId: PublisherIds.ACU,
    type: 'audio',
    name: 'Christian Unity in Diversity',
    shortDescription:
      'Understand how the gospel unites diverse people into one body of Christ.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=50',
    contentUrl: 'https://christianed.com/courses/unity-diversity',
  },

  // 41–50: additional non-tech courses, alternating ACU/IWU
  {
    id: '50a1b2c3d4e5',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: 'Deacons and Elders: Biblical Qualifications',
    shortDescription:
      'Study New Testament guidance for church offices and the character required for leadership.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=51',
    contentUrl: 'https://christianed.com/courses/deacons-elders',
  },
  {
    id: '61b2c3d4e5f6',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'Sermon Preparation Workshop',
    shortDescription:
      'A practical guide to exegesis, structure, and delivery for faithful, compelling sermons.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=52',
    contentUrl: 'https://christianed.com/courses/sermon-prep',
  },
  {
    id: '72c3d4e5f6a7',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'Biblical Languages: Greek Basics',
    shortDescription:
      'Learn foundational Koine Greek to read the New Testament with greater clarity.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=53',
    contentUrl: 'https://christianed.com/courses/greek-basics',
  },
  {
    id: '83d4e5f6a7b8',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Biblical Languages: Hebrew Basics',
    shortDescription:
      'Gain essential Hebrew tools for engaging Old Testament texts more deeply.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=54',
    contentUrl: 'https://christianed.com/courses/hebrew-basics',
  },
  {
    id: '94e5f6a7b8c9',
    publisherId: PublisherIds.IWU,
    type: 'video',
    name: 'Christian Spiritual Formation',
    shortDescription:
      'Practices and pathways that form Christlike character in community over time.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=55',
    contentUrl: 'https://christianed.com/courses/spiritual-formation',
  },
  {
    id: 'a5f6a7b8c9d0',
    publisherId: PublisherIds.ACU,
    type: 'audio',
    name: 'Youth Ministry Foundations',
    shortDescription:
      'Biblical vision and practical frameworks for discipling the next generation.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=56',
    contentUrl: 'https://christianed.com/courses/youth-ministry',
  },
  {
    id: 'b6a7b8c9d0e1',
    publisherId: PublisherIds.IWU,
    type: 'article',
    name: "Children's Ministry Essentials",
    shortDescription:
      'Create safe, engaging environments to introduce children to the story of Scripture.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=57',
    contentUrl: 'https://christianed.com/courses/childrens-ministry',
  },
  {
    id: 'c7b8c9d0e1f2',
    publisherId: PublisherIds.ACU,
    type: 'video',
    name: 'Urban Ministry and Justice',
    shortDescription:
      'Serve cities with a holistic gospel that addresses both spiritual and social needs.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=58',
    contentUrl: 'https://christianed.com/courses/urban-ministry',
  },
  {
    id: 'd8c9d0e1f2a3',
    publisherId: PublisherIds.IWU,
    type: 'audio',
    name: 'Global Church: Majority World Christianity',
    shortDescription:
      'Explore the growth, challenges, and gifts of the church beyond the West.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=59',
    contentUrl: 'https://christianed.com/courses/majority-world',
  },
  {
    id: 'e9d0e1f2a3b4',
    publisherId: PublisherIds.ACU,
    type: 'article',
    name: 'Pastoral Care in Crisis and Trauma',
    shortDescription:
      'Biblical wisdom and best practices for caring for people in seasons of acute hardship.',
    thumbnailUrl: 'https://picsum.photos/300/200?random=60',
    contentUrl: 'https://christianed.com/courses/crisis-care',
  },
  {
    id: 'd8a72f19ec8a',
    publisherId: PublisherIds.APPLE,
    type: 'article',
    name: 'What do Prototypes Prototype?',
    shortDescription:
      "Prototypes answer questions about a product's role, look and feel, and implementation.",
    thumbnailUrl: 'https://picsum.photos/300/200?random=61',
    contentUrl:
      'https://hci.stanford.edu/courses/cs247/2012/readings/WhatDoPrototypesPrototype.pdf',
  },
];

const seededPublishers: Publisher[] = [
  {
    id: PublisherIds.ACU,
    name: 'Austin Christian University (ACU) - Updated',
  },
  {
    id: PublisherIds.BETHEL_TECH,
    name: 'Bethel Tech',
  },
  {
    id: PublisherIds.IWU,
    name: 'Indiana Wesleyan University (IWU)',
  },
  {
    id: PublisherIds.CAREY_NIEUWHOF,
    name: 'Carey Nieuwhof',
  },
  {
    id: PublisherIds.APPLE,
    name: 'Apple Inc.',
  },
];

/**
 * Only self-invoke if this file is being run directly
 * (not imported as a module)
 */
if (require.main === module) {
  seedContentSchemas()
    .then(() => {
      console.log('(content schemas) Database seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('(content schemas) Database seeding failed:', error);
      process.exit(1);
    });
}
