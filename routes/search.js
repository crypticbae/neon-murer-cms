const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/search - Universal search endpoint
router.get('/', async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ results: [] });
    }

    const searchTerm = query.trim();
    const results = [];

    // Search Team Members / Kontaktpersonen
    try {
      const teamMembers = await prisma.teamMember.findMany({
        where: {
          isActive: true,
          isPublic: true,
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { position: { contains: searchTerm, mode: 'insensitive' } },
            { department: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
          email: true,
          phone: true
        },
        take: 5
      });

      teamMembers.forEach(member => {
        results.push({
          type: 'team_member',
          title: `${member.firstName} ${member.lastName}`,
          description: `${member.position}${member.department ? ` - ${member.department}` : ''}`,
          url: 'neon-murer/kontaktpersonen.html',
          category: 'Kontaktpersonen',
          score: 10,
          data: member
        });
      });
    } catch (error) {
      console.error('Error searching team members:', error);
    }

    // Search News Articles
    try {
      const newsArticles = await prisma.newsArticle.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
            { excerpt: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          publishDate: true
        },
        take: 3
      });

      newsArticles.forEach(article => {
        results.push({
          type: 'news',
          title: article.title,
          description: article.excerpt || 'News-Artikel',
          url: 'neon-murer/news.html',
          category: 'News',
          score: 8,
          data: article
        });
      });
    } catch (error) {
      console.error('Error searching news:', error);
    }

    // Search Job Offers
    try {
      const jobs = await prisma.job.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { requirements: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          employmentType: true
        },
        take: 3
      });

      jobs.forEach(job => {
        results.push({
          type: 'job',
          title: job.title,
          description: `${job.employmentType} - ${job.location}`,
          url: 'neon-murer/stellenangebote.html',
          category: 'Stellenangebote',
          score: 7,
          data: job
        });
      });
    } catch (error) {
      console.error('Error searching jobs:', error);
    }

    // Search Dienstleistungen
    try {
      const services = await prisma.dienstleistungService.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { shortDescription: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          shortDescription: true,
          description: true
        },
        take: 5
      });

      services.forEach(service => {
        results.push({
          type: 'service',
          title: service.title,
          description: service.shortDescription || service.description?.substring(0, 100) + '...' || 'Dienstleistung',
          url: 'dienstleistungen.html',
          category: 'Dienstleistungen',
          score: 9,
          data: service
        });
      });
    } catch (error) {
      console.error('Error searching services:', error);
    }

    // Search Company History
    try {
      const historyEntries = await prisma.companyHistory.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          year: true
        },
        take: 3
      });

      historyEntries.forEach(entry => {
        results.push({
          type: 'history',
          title: `${entry.year}: ${entry.title}`,
          description: entry.description || 'Firmengeschichte',
          url: 'neon-murer/firmengeschichte.html',
          category: 'Firmengeschichte',
          score: 6,
          data: entry
        });
      });
    } catch (error) {
      console.error('Error searching company history:', error);
    }

    // Search Fachkompetenzen
    try {
      const competencies = await prisma.fachkompetenz.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          icon: true
        },
        take: 3
      });

      competencies.forEach(comp => {
        results.push({
          type: 'competency',
          title: comp.title,
          description: comp.description || 'Fachkompetenz',
          url: 'neon-murer/fachkompetenzen.html',
          category: 'Fachkompetenzen',
          score: 6,
          data: comp
        });
      });
    } catch (error) {
      console.error('Error searching competencies:', error);
    }

    // Sort by score (descending) and limit results
    results.sort((a, b) => b.score - a.score);
    const limitedResults = results.slice(0, parseInt(limit));

    res.json({
      query: searchTerm,
      results: limitedResults,
      total: limitedResults.length
    });

  } catch (error) {
    console.error('Error in search endpoint:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
