import axios from 'axios';
import { handleError } from '../../utils/errorHandler';

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
    timestamp?: Date;
}

class DuckDuckGoService {
    private baseUrl = 'https://api.duckduckgo.com/';
    private userAgent = 'SafetyLens/1.0';

    async search(query: string): Promise<SearchResult[]> {
        try {
            let params = {
                q: query,
                format: 'json',
                no_html: 1,
                no_redirect: 1,
                t: this.userAgent
            };

            let response = await axios.get(this.baseUrl, { params });

            if (!response.data || !response.data.RelatedTopics) {
                return [];
            }

            return response.data.RelatedTopics.map((topic: any) => ({
                title: topic.Text?.split(' - ')[0] || '',
                link: topic.FirstURL || '',
                snippet: topic.Text || '',
                source: 'DuckDuckGo',
                timestamp: new Date()
            })).filter((result: SearchResult) => result.title && result.link);
        } catch (error) {
            handleError(error, 'DuckDuckGoService.search');
            return [];
        }
    }

    async instantAnswer(query: string): Promise<string | null> {
        try {
            let params = {
                q: query,
                format: 'json',
                no_html: 1,
                skip_disambig: 1,
                t: this.userAgent
            };

            let response = await axios.get(this.baseUrl, { params });
            return response.data.AbstractText || null;
        } catch (error) {
            handleError(error, 'DuckDuckGoService.instantAnswer');
            return null;
        }
    }
}

export let duckDuckGoService = new DuckDuckGoService(); 