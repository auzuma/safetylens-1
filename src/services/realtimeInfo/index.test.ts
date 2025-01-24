import axios from 'axios';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { sendGroqRequest } from '../groqAi';
import { duckDuckGoService, SearchResult } from "../duckDuckGo";
import { realtimeInfoService } from '.';

jest.mock('../duckDuckGo');
jest.mock('../groqAi');
jest.mock('axios');

describe('RealtimeInfoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('successfully retrieves and combines data from multiple sources', async () => {
        // Mock Groq AI query optimization
        (sendGroqRequest as jest.Mock).mockResolvedValueOnce(`
            REFINED QUERY: tesla stock price
            SCOPE: SPECIFIC
            TEMPORALITY: URGENT
            SEARCH STRATEGY: Combined
        ` as never);

        // Mock DuckDuckGo results
        (duckDuckGoService.search as jest.Mock).mockResolvedValue([
            {
                title: 'Tesla Stock',
                link: 'https://example.com/tesla',
                snippet: 'Latest Tesla stock price',
                source: 'DuckDuckGo'
            }
        ] as never);

        (duckDuckGoService.instantAnswer as jest.Mock).mockResolvedValue(
            'Tesla stock is trading at $XXX' as never
        );

        // Mock web scraping response
        (axios.get as jest.Mock).mockResolvedValue({
            data: `
                <html>
                    <main>
                        <article>Tesla stock price information</article>
                    </main>
                </html>
            `
        } as never);

        let results = await realtimeInfoService.getInfo('what is tesla stock price');

        expect(results.length).toBeGreaterThan(0);
        expect(results[0].confidence).toBeGreaterThan(0);
        expect(results[0].source).toBeDefined();
        expect(results).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    source: 'DuckDuckGo-Instant',
                    confidence: 0.9
                })
            ])
        );
    });

    test('handles failed query optimization gracefully', async () => {
        (sendGroqRequest as jest.Mock).mockRejectedValue(new Error('API Error') as never);

        let results = await realtimeInfoService.getInfo('test query');

        expect(results).toEqual([]);
    });

    test('sorts results by confidence and timestamp', async () => {
        (sendGroqRequest as jest.Mock).mockResolvedValueOnce(`
            REFINED QUERY: weather forecast
            SCOPE: SPECIFIC
            TEMPORALITY: URGENT
            SEARCH STRATEGY: Combined
        ` as never);

        let mockResults: SearchResult[] = [
            {
                title: 'Weather Low Confidence',
                link: 'https://example.com/weather1',
                snippet: 'Weather info 1',
                source: 'DuckDuckGo'
            },
            {
                title: 'Weather High Confidence',
                link: 'https://example.com/weather2',
                snippet: 'Weather info 2',
                source: 'DuckDuckGo'
            }
        ];

        (duckDuckGoService.search as jest.Mock).mockResolvedValue(mockResults as never);
        (duckDuckGoService.instantAnswer as jest.Mock).mockResolvedValue('Weather forecast' as never);
        (axios.get as jest.Mock).mockResolvedValue({ data: '<html><body>Weather data</body></html>' } as never);

        let results = await realtimeInfoService.getInfo('what is the weather');

        expect(results[0].confidence).toBeGreaterThanOrEqual(results[1].confidence);
    });

    test('handles web scraping errors gracefully', async () => {
        (sendGroqRequest as jest.Mock).mockResolvedValueOnce(`
            REFINED QUERY: test query
            SCOPE: BROAD
            TEMPORALITY: RECENT
            SEARCH STRATEGY: Combined
        ` as never);

        (duckDuckGoService.search as jest.Mock).mockResolvedValue([
            {
                title: 'Test Result',
                link: 'https://example.com/test',
                snippet: 'Test snippet',
                source: 'DuckDuckGo'
            }
        ] as never);

        (axios.get as jest.Mock).mockRejectedValue(new Error('Network error') as never);

        let results = await realtimeInfoService.getInfo('test query');

        expect(results.length).toBeGreaterThan(0);
        expect(results.every(r => r.source !== 'Web-Scraping')).toBeTruthy();
    });
}); 