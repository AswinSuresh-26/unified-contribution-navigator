import natural from "natural";
import { Project } from "@prisma/client";

const TfIdf = natural.TfIdf;

export function findSuitableProjects(userSkills: string[], projects: Project[]): Project[] {
  const tfidf = new TfIdf();

  // Add project documents to TF-IDF
  projects.forEach((project) => {
    const document = [
      project.name,
      project.description,
      ...project.tags
    ].join(" ").toLowerCase();
    tfidf.addDocument(document);
  });

  // Create a document from user skills
  const userSkillsText = userSkills.join(" ").toLowerCase();

  // Calculate similarities
  const similarities = projects.map((project, index) => {
    let similarity = 0;
    userSkills.forEach(skill => {
      similarity += tfidf.tfidf(skill.toLowerCase(), index);
    });
    return { project, similarity };
  });

  // Sort by similarity and return top 5
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, 5).map(item => item.project);
} 