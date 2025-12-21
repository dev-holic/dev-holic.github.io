import fs from 'fs/promises';
import path from 'path';
import Parser from 'rss-parser';
import axios from 'axios';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';

// Environment Variables
const SLACK_WEBHOOK_URL = process.env.SLACK_RSS_WEBHOOK_URL;
const RSS_FEED_LIST_ENV = process.env.RSS_FEED_LIST;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = path.join(__dirname, '../history.json');

type FeedConfig = {
  title: string;
  url: string;
};

type HistoryState = {
  lastRun: string;
};

const parser = new Parser();

async function getHistory(): Promise<HistoryState> {
  try {
    const data = await fs.readFile(HISTORY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Default to 24 hours ago if no history exists
    return { lastRun: dayjs().subtract(1, 'day').toISOString() };
  }
}

async function saveHistory(state: HistoryState) {
  await fs.writeFile(HISTORY_PATH, JSON.stringify(state, null, 2));
}

async function sendToSlack(feedTitle: string, item: Parser.Item) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('⚠️ No SLACK_RSS_WEBHOOK_URL provided. Skipping notification.');
    return;
  }

  const message = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${feedTitle}*\n<${item.link}|${item.title}>\n${dayjs(item.pubDate).format('YYYY-MM-DD HH:mm')}`
        }
      }
    ]
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log(`✅ Sent to Slack: [${feedTitle}] ${item.title}`);
  } catch (error) {
    console.error(`❌ Failed to send to Slack:`, error);
  }
}

async function main() {
  console.log('🚀 Starting News Bot...');

  if (!RSS_FEED_LIST_ENV) {
    console.error('❌ RSS_FEED_LIST environment variable is missing.');
    process.exit(1);
  }

  let feeds: FeedConfig[] = [];
  try {
    feeds = JSON.parse(RSS_FEED_LIST_ENV);
  } catch (error) {
    console.error('❌ Failed to parse RSS_FEED_LIST JSON.');
    process.exit(1);
  }

  const history = await getHistory();
  const lastRun = dayjs(history.lastRun);
  const currentRun = dayjs();

  console.log(`📅 Last run: ${lastRun.format()}`);
  console.log(`📋 Processing ${feeds.length} feeds...`);

  let newPostsCount = 0;

  for (const feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      
      // Filter items newer than last run
      // Note: Some RSS feeds might not have isoDate, fallback to pubDate
      const newItems = parsedFeed.items.filter(item => {
        const itemDate = dayjs(item.isoDate || item.pubDate);
        return itemDate.isAfter(lastRun);
      });

      // Sort oldest to newest for chronological sending
      newItems.sort((a, b) => {
        const dateA = dayjs(a.isoDate || a.pubDate);
        const dateB = dayjs(b.isoDate || b.pubDate);
        return dateA.diff(dateB);
      });

      if (newItems.length > 0) {
        console.log(`Found ${newItems.length} new items in ${feed.title}`);
        for (const item of newItems) {
          await sendToSlack(feed.title, item);
          newPostsCount++;
        }
      }

    } catch (error) {
      console.error(`❌ Error processing feed ${feed.title}:`, error);
    }
  }

  // Update history only if we successfully processed (or attempted)
  // We set it to currentRun to avoid processing the same items next time
  await saveHistory({ lastRun: currentRun.toISOString() });
  
  console.log(`🏁 Finished. Sent ${newPostsCount} new posts.`);
}

main();
