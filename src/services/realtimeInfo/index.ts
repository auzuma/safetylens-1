import * as cheerio from 'cheerio';
import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { getPrompt } from '../../utils/promptGetter';
import { duckDuckGoService } from "../duckDuckGo";
import { sendGroqRequest } from '../groqAi';

export interface RealtimeResult {
    data: any;
    source: string;
    timestamp: Date;
    confidence: number;
}

class RealtimeInfoService {
    private readonly SCRAPING_TIMEOUT = 5000;

    async getInfo(query: string): Promise<RealtimeResult[]> {
        try {
            // First, optimize the query using Groq AI
            let optimizedQuery = await this.optimizeQuery(query);
            if (!optimizedQuery) {
                return [];
            }

            // Then, retrieve optimizedQueries's necessary fields
            let {
                refinedQuery
            } = optimizedQuery;

            // Initialize results array
            let results: RealtimeResult[] = [];

            // Parallel execution of different data sources
            let [duckDuckGoResults, scrapedData] = await Promise.all([
                refinedQuery ? this.getDuckDuckGoData(refinedQuery) : [],
                refinedQuery ? this.getScrapedData(refinedQuery) : []
            ]);

            results.push(...duckDuckGoResults, ...scrapedData);

            // Sort by confidence and timestamp
            return results.sort((a, b) =>
                b.confidence - a.confidence ||
                b.timestamp.getTime() - a.timestamp.getTime()
            );
        } catch (error) {
            handleError(error, 'RealtimeInfoService.getInfo');
            return [];
        }
    }

    private async optimizeQuery(query: string) {
        try {
            let prompt = await this.loadPrompt();
            let response = await sendGroqRequest(
                [{
                    role: 'user',
                    content: query
                }],
                prompt
            );

            // Parse the response based on the prompt format
            let lines = response?.split('\n');
            let refinedQuery = lines?.find(l => l.startsWith('REFINED QUERY:'))?.split(':')[1]?.trim();
            let scope = lines?.find(l => l.startsWith('SCOPE:'))?.split(':')[1]?.trim();
            let temporality = lines?.find(l => l.startsWith('TEMPORALITY:'))?.split(':')[1]?.trim();
            let strategy = lines?.find(l => l.startsWith('SEARCH STRATEGY:'))?.split(':')[1]?.trim();

            return {
                refinedQuery,
                scope,
                temporality,
                strategy
            };
        } catch (error) {
            handleError(error, 'RealtimeInfoService.optimizeQuery');
            return null;
        }
    }

    private async loadPrompt(): Promise<string> {
        try {
            return getPrompt('realtimeQueryManager');
        } catch (error) {
            handleError(error, 'RealtimeInfoService.loadPrompt');
            throw error;
        }
    }

    private async getDuckDuckGoData(query: string): Promise<RealtimeResult[]> {
        try {
            let searchResults = await duckDuckGoService.search(query);
            let instantAnswer = await duckDuckGoService.instantAnswer(query);

            let results: RealtimeResult[] = searchResults.map(result => ({
                data: result,
                source: 'DuckDuckGo-Search',
                timestamp: new Date(),
                confidence: 0.7
            }));

            if (instantAnswer) {
                results.unshift({
                    data: { answer: instantAnswer },
                    source: 'DuckDuckGo-Instant',
                    timestamp: new Date(),
                    confidence: 0.9
                });
            }

            return results;
        } catch (error) {
            handleError(error, 'RealtimeInfoService.getDuckDuckGoData');
            return [];
        }
    }

    private async getScrapedData(query: string): Promise<RealtimeResult[]> {
        try {
            let searchResults = await duckDuckGoService.search(query);
            let results: RealtimeResult[] = [];

            // Only scrape the top 3 results
            for (let result of searchResults.slice(0, 3)) {
                try {
                    let response = await axios.get(result.link, {
                        timeout: this.SCRAPING_TIMEOUT,
                        headers: {
                            'User-Agent': 'SafetyLens/1.0'
                        }
                    });

                    let $ = cheerio.load(response.data);

                    // Remove script and style elements
                    $('script').remove();
                    $('style').remove();

                    // Extract main content
                    let mainContent = $('main, article, .content, #content').first().text() ||
                        $('body').text();

                    // Clean and trim the content
                    mainContent = mainContent
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 1000); // Limit content length

                    results.push({
                        data: {
                            url: result.link,
                            content: mainContent,
                            title: result.title
                        },
                        source: 'Web-Scraping',
                        timestamp: new Date(),
                        confidence: 0.6
                    });
                } catch (scrapeError) {
                    // Skip failed scrapes silently
                    continue;
                }
            }

            return results;
        } catch (error) {
            handleError(error, 'RealtimeInfoService.getScrapedData');
            return [];
        }
    }
}

export let realtimeInfoService = new RealtimeInfoService(); 