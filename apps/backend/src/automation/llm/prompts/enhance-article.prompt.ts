import { EnhanceArticleParams } from '../llm.interface';

/**
 * Build comprehensive prompt for article enhancement
 *
 * This prompt is designed to:
 * 1. Analyze top-ranking articles for structure and depth
 * 2. Enhance the original article to match their quality
 * 3. Preserve original meaning and intent
 * 4. Improve formatting and readability
 */
export function buildEnhanceArticlePrompt(
  params: EnhanceArticleParams,
): string {
  const {
    originalTitle,
    originalContent,
    reference1Title,
    reference1Content,
    reference2Title,
    reference2Content,
  } = params;

  return `You are an expert content editor and SEO specialist. Your task is to enhance an article to match the quality and depth of top-ranking articles on Google.

## ORIGINAL ARTICLE TO ENHANCE

**Title:** ${originalTitle}

**Content:**
${originalContent}

---

## TOP-RANKING REFERENCE ARTICLES

### Reference Article 1: "${reference1Title}"
${reference1Content.substring(0, 3000)}${reference1Content.length > 3000 ? '...' : ''}

### Reference Article 2: "${reference2Title}"
${reference2Content.substring(0, 3000)}${reference2Content.length > 3000 ? '...' : ''}

---

## YOUR TASK

Analyze the reference articles and enhance the original article following these guidelines:

### 1. STRUCTURE & FORMATTING
- Use clear headings and subheadings (H2, H3) like the reference articles
- Break content into digestible sections
- Use bullet points and numbered lists where appropriate
- Add paragraph breaks for readability

### 2. CONTENT DEPTH
- Match the level of detail found in reference articles
- Add explanations, examples, or context where reference articles go deeper
- Include relevant statistics, facts, or insights if references do
- Expand on key points that are briefly mentioned

### 3. TONE & STYLE
- Maintain a professional, informative tone
- Write in a clear, engaging manner
- Use active voice where possible
- Keep sentences concise and readable

### 4. PRESERVE ORIGINAL INTENT
- **CRITICAL:** Do NOT change the core message or meaning
- Keep the original perspective and key arguments
- Maintain any unique insights from the original
- Do NOT plagiarize from reference articles

### 5. SEO OPTIMIZATION
- Use natural keyword variations
- Include relevant terms found in top-ranking articles
- Ensure content is comprehensive and authoritative

## OUTPUT REQUIREMENTS

Return ONLY the enhanced article content in markdown format.
- Start with the title as H1 (# Title)
- Use proper markdown formatting (##, ###, -, *, etc.)
- Do NOT include meta-commentary or explanations
- Do NOT add a references section (that will be added separately)

## ENHANCED ARTICLE:`;
}
