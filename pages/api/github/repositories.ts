import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    const { query, page = '1', per_page = '100' } = req.query;

    // Construct the GitHub API URL
    const baseUrl = 'https://api.github.com/search/repositories';
    const searchQuery = query || 'stars:>100';
    const url = `${baseUrl}?q=${searchQuery}&sort=stars&order=desc&page=${page}&per_page=${per_page}`;

    // Make the request to GitHub API
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(session?.accessToken && {
          Authorization: `Bearer ${session.accessToken}`
        }),
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch repositories');
    }

    const data = await response.json();
    
    return res.status(200).json({
      items: data.items,
      total_count: data.total_count,
      incomplete_results: data.incomplete_results
    });
  } catch (error) {
    console.error('GitHub API Error:', error);
    return res.status(500).json({ 
      message: 'Error fetching repositories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 