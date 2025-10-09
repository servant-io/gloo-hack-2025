# Affiliate Recommendations API

This API endpoint provides affiliate recommendations from the Gloo AI platform based on search queries.

## Endpoint

```
GET /api/glooai/affiliate-recommendations
```

## Parameters

### Required Parameters

- `q` (string): Search query for finding affiliate recommendations

### Optional Parameters

- `max_snippet_count_overall` (integer): Maximum number of snippets to return overall
- `media_types` (string): Comma-separated list of media types to filter by
- `min_snippet_count_per_item` (integer): Minimum number of snippets per item
- `publishers` (string): Comma-separated list of publishers to filter by
- `certainty_threshold` (float): Certainty threshold for filtering results (0.0 to 1.0)

## Request Examples

### Basic Request

```bash
curl -X GET "http://localhost:3002/api/glooai/affiliate-recommendations?q=understanding+the+gospel"
```

### Request with Optional Parameters

```bash
curl -X GET "http://localhost:3002/api/glooai/affiliate-recommendations?q=understanding+the+gospel&max_snippet_count_overall=10&media_types=article,video&publishers=The+Bible+Project,Desiring+God&certainty_threshold=0.8"
```

## Response Format

### Success Response

```json
{
  "query": "understanding the gospel",
  "results": [
    {
      "id": "12345",
      "title": "What is the Gospel? A Clear Explanation",
      "url": "https://bibleproject.com/explore/gospel",
      "snippet": "The gospel is the good news that Jesus Christ died for our sins and rose again, offering salvation to all who believe...",
      "publisher": "The Bible Project",
      "media_type": "article",
      "certainty_score": 0.95,
      "affiliate_links": [
        {
          "retailer": "Amazon",
          "url": "https://amazon.com/dp/B08XYZ1234",
          "commission_rate": 0.05
        }
      ]
    },
    {
      "id": "67890",
      "title": "The Gospel in 5 Minutes - Video Explanation",
      "url": "https://desiringgod.org/articles/gospel-explained",
      "snippet": "John Piper explains the core message of Christianity and what it means to be saved by grace through faith...",
      "publisher": "Desiring God",
      "media_type": "video",
      "certainty_score": 0.88,
      "affiliate_links": [
        {
          "retailer": "Christian Book",
          "url": "https://christianbook.com/dp/B09ABC5678",
          "commission_rate": 0.07
        }
      ]
    }
  ],
  "count": 2,
  "options": {
    "max_snippet_count_overall": 10,
    "media_types": ["article", "video"],
    "publishers": ["The Bible Project", "Desiring God"],
    "certainty_threshold": 0.8
  }
}
```

### Error Responses

#### Missing Required Parameter

```json
{
  "error": "Search query parameter \"q\" is required"
}
```

#### Authentication Error

```json
{
  "error": "Authentication failed with Gloo AI platform"
}
```

#### Service Unavailable

```json
{
  "error": "Failed to fetch recommendations from Gloo AI platform"
}
```

#### Internal Server Error

```json
{
  "error": "Failed to fetch affiliate recommendations"
}
```

## Error Codes

- `400`: Bad Request - Missing required parameters
- `401`: Unauthorized - Authentication failed with Gloo AI platform
- `500`: Internal Server Error - General server error
- `502`: Bad Gateway - Failed to fetch from Gloo AI platform

## Usage Notes

- The `q` parameter is required and must be URL-encoded
- Optional parameters can be combined as needed
- Results are returned in descending order of relevance/certainty
- The API automatically handles pagination and rate limiting
- All affiliate links are validated and sanitized before being returned

## Example Use Cases

1. **Bible Study Resources**: Search for study materials on specific books of the Bible or theological topics
2. **Sermon Preparation**: Find relevant content for sermon topics from trusted publishers
3. **Publisher Filtering**: Focus on content from specific faith-based publishers like The Bible Project or Desiring God
4. **Quality Filtering**: Use certainty threshold to filter high-quality theological content
5. **Small Group Materials**: Discover resources for small group Bible studies and discussions
6. **Personal Devotion**: Find daily devotionals and spiritual growth content
