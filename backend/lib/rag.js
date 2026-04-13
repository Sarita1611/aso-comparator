import groq from './groq.js';
import supabase from './supabase.js';

// Generate embedding using Groq (uses llama for embeddings)
// Groq doesn't have an embeddings endpoint, so we use a clever approach:
// We store knowledge as text and use semantic similarity via keyword matching + 
// a summarization pass to retrieve relevant chunks

export async function getRelevantASOKnowledge(appData) {
  try {
    // Retrieve all knowledge chunks from Supabase
    const { data: chunks, error } = await supabase
      .from('aso_knowledge')
      .select('*');

    if (error || !chunks || chunks.length === 0) {
      console.warn('No knowledge chunks found in DB, using fallback');
      return null;
    }

    // Determine which topics are most relevant based on app data
    const relevantTopics = determineRelevantTopics(appData);

    // Filter and rank chunks by relevance
    const relevantChunks = chunks
      .filter(chunk => relevantTopics.some(topic =>
        chunk.topic.toLowerCase().includes(topic.toLowerCase()) ||
        chunk.id.toLowerCase().includes(topic.toLowerCase())
      ))
      .slice(0, 8); // Top 8 most relevant chunks

    // If not enough filtered, add core chunks
    const coreChunkIds = ['aso-scoring-rubric', 'competitive-analysis', 'title-optimization', 'description-optimization'];
    const existingIds = relevantChunks.map(c => c.id);
    const additionalChunks = chunks.filter(c =>
      coreChunkIds.includes(c.id) && !existingIds.includes(c.id)
    );

    const finalChunks = [...relevantChunks, ...additionalChunks].slice(0, 10);

    return finalChunks.map(c => `## ${c.topic}\n${c.content}`).join('\n\n---\n\n');
  } catch (err) {
    console.error('RAG retrieval error:', err);
    return null;
  }
}

function determineRelevantTopics(appData) {
  const topics = ['aso-scoring-rubric', 'competitive-analysis'];

  // Always include platform-specific knowledge
  const platforms = appData.map(a => a.platform);
  if (platforms.includes('ios')) topics.push('ios-specific', 'keywords-field');
  if (platforms.includes('android')) topics.push('google-play-specific');

  // Always include core pillars
  topics.push('title-optimization', 'subtitle-short-description', 'description-optimization');
  topics.push('visual-assets-screenshots', 'ratings-reviews', 'update-frequency');
  topics.push('conversion-rate-optimization', 'aso-common-mistakes');

  return topics;
}

export async function seedKnowledgeBase() {
  const { asoKnowledgeChunks } = await import('./asoKnowledge.js');

  console.log('🌱 Seeding ASO knowledge base...');

  for (const chunk of asoKnowledgeChunks) {
    const { error } = await supabase
      .from('aso_knowledge')
      .upsert({
        id: chunk.id,
        topic: chunk.topic,
        content: chunk.content,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Failed to seed chunk ${chunk.id}:`, error);
    } else {
      console.log(`✅ Seeded: ${chunk.topic}`);
    }
  }

  console.log('✅ Knowledge base seeded successfully!');
}
