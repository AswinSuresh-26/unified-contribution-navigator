import type { Project } from "@prisma/client";

interface TermFrequency {
  [term: string]: number;
}

interface DocumentFrequency {
  [term: string]: number;
}

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(term => term.length > 0);
}

function calculateTF(terms: string[]): TermFrequency {
  const tf: TermFrequency = {};
  terms.forEach(term => {
    tf[term] = (tf[term] || 0) + 1;
  });
  return tf;
}

function calculateIDF(documents: string[][]): DocumentFrequency {
  const df: DocumentFrequency = {};
  const N = documents.length;

  documents.forEach(doc => {
    // Count term presence only once per document
    const uniqueTerms = new Set(doc);
    uniqueTerms.forEach(term => {
      df[term] = (df[term] || 0) + 1;
    });
  });

  // Convert to IDF
  Object.keys(df).forEach(term => {
    df[term] = Math.log(N / df[term]);
  });

  return df;
}

function calculateSimilarity(queryTerms: string[], docTerms: string[], idf: DocumentFrequency): number {
  const queryTF = calculateTF(queryTerms);
  const docTF = calculateTF(docTerms);
  
  let similarity = 0;
  Object.keys(queryTF).forEach(term => {
    if (docTF[term] && idf[term]) {
      similarity += queryTF[term] * docTF[term] * idf[term];
    }
  });
  
  return similarity;
}

export function findSuitableProjects(userSkills: string[], projects: Project[]): Project[] {
  // Prepare documents
  const documents = projects.map(project => {
    const text = `${project.name} ${project.description} ${project.tags.join(' ')}`;
    return tokenize(text);
  });

  // Add user skills as a document
  const queryTerms = userSkills.flatMap(skill => tokenize(skill));
  
  // Calculate IDF for all documents
  const idf = calculateIDF([...documents, queryTerms]);

  // Calculate similarities
  const similarities = projects.map((project, index) => ({
    project,
    similarity: calculateSimilarity(queryTerms, documents[index], idf)
  }));

  // Sort by similarity and return top 5
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, 5).map(item => item.project);
} 