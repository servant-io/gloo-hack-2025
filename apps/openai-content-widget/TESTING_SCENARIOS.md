# Testing Different ChatGPT Discovery Scenarios

This POC simulates how users would discover and use the Scripture Journey Explorer through ChatGPT. To test different scenarios, you can easily swap out the mock user query.

## How to Change the Mock Query

**File:** `src/config/mockUserQuery.ts`

### Option 1: Use One of the Provided Scenarios

Simply change which query is exported:

```typescript
// Default - change this line
export const DEFAULT_MOCK_QUERY: MockUserQuery = EARLY_CHURCH_QUERY;
```

Available scenarios:

- `DEFAULT_MOCK_QUERY` - Bible study leader (default)
- `EARLY_CHURCH_QUERY` - Interested in early church history
- `THEOLOGICAL_QUERY` - Comparative Gospel study
- `NEW_BELIEVER_QUERY` - New Christian seeking guidance
- `ACADEMIC_QUERY` - Academic research focus

### Option 2: Create Your Own Scenario

Add a new query object:

```typescript
export const MY_CUSTOM_QUERY: MockUserQuery = {
  originalPrompt: 'Your simulated ChatGPT question here...',
  contentTheme: 'Luke-Acts', // Content filter
  conversationContext: "Additional context about the user's situation",
};
```

Then export it as the default:

```typescript
export const DEFAULT_MOCK_QUERY: MockUserQuery = MY_CUSTOM_QUERY;
```

## What Gets Affected

When you change the mock query, these are updated:

### 1. AI-Generated Overview

The overview explains how the video collection addresses the user's specific question.

**Example with Bible Study Leader:**

> "This collection helps you prepare for your Bible study by showing how Luke and Acts form a unified narrative about Jesus and the early church..."

**Example with New Believer:**

> "Starting with Luke is an excellent choice! This collection walks you through Luke's accessible narrative, perfect for understanding the basics of Jesus' life and teaching..."

### 2. Key Themes

Themes are selected based on relevance to the user's question and context.

**Example with Academic Researcher:**

> "**Literary Structure**: Examining Luke's use of parallel narratives and thematic connections..."

**Example with Early Church Focus:**

> "**Missionary Expansion**: Tracing Christianity's geographic and cultural spread from Jerusalem to Rome..."

### 3. Relevance Explanation

The explanation connects the discovered content to the user's original need.

**Example with Theological Query:**

> "These videos directly compare Luke's unique perspective—emphasizing Jesus as Savior for all humanity—with the other Gospels' theological emphases..."

## Testing Workflow

1. **Change the query** in `src/config/mockUserQuery.ts`
2. **Restart dev server** (or wait for hot reload)
3. **Observe AI responses** in the widget
4. **Compare how Gloo AI adapts** to different user contexts

This demonstrates how the widget would feel to different types of users discovering it through ChatGPT.

## Tips for Creating Test Scenarios

### Good User Queries

✅ **Specific and contextual:**

```
"I'm preparing a sermon on Acts 2 and want to understand the Pentecost event in its historical context."
```

✅ **Shows clear intent:**

```
"My teenager asked me about the Holy Spirit. How can I explain Luke's teachings on the Spirit in a way that's relatable?"
```

### Weak User Queries

❌ **Too vague:**

```
"Tell me about Luke"
```

❌ **No context:**

```
"What is Acts?"
```

### Good Conversation Context

✅ **Reveals user's situation:**

```
"User is a youth pastor looking for engaging teaching materials"
```

✅ **Explains the need:**

```
"User's church is doing a series on the Gospels and wants to understand each author's unique perspective"
```

## Observing the Impact

Watch these areas to see how Gloo AI adapts:

1. **Overview Section** (left column, top)
   - Should directly reference the user's question
   - Tone should match the user's context (academic, pastoral, personal)

2. **Key Themes** (left column, middle)
   - Themes selected based on relevance to query
   - Explanations tailored to user's level and interest

3. **Relevance Section** (left column, bottom)
   - Enthusiastic about the content match
   - Specific about what insights the user will gain
   - Connects back to their original question

4. **Video Context** (when clicking a video)
   - Overview adapts to show how this specific video helps
   - Relevance explains why this video matters for their need

## Example Comparison

### Query: "I'm teaching a Bible study" vs "I'm writing an academic paper"

**Bible Study (Pastoral):**

- Tone: Encouraging, practical
- Themes: Accessible, application-focused
- Focus: Teaching tools, group discussion

**Academic Paper (Scholarly):**

- Tone: Analytical, detailed
- Themes: Literary structure, historical context
- Focus: Scholarly analysis, citations

The same video content, but Gloo AI frames it differently based on who's asking and why!
