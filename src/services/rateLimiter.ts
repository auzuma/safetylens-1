import { logger } from "../utils/logger";

interface QueuedRequest {
    id: string;
    timestamp: number;
    retryCount: number;
    execute: () => Promise<any>;
}

export class RateLimiter {
    private requestsThisMinute: number = 0;
    private lastResetTime: number = Date.now();
    private readonly requestQueue: QueuedRequest[] = [];
    private readonly maxRequestsPerMinute: number = 30;
    private readonly maxRetries: number = 3;
    private readonly baseDelayMs: number = 2000;
    private processing: boolean = false;

    private resetCounterIfNeeded(): void {
        let now = Date.now();
        if (now - this.lastResetTime >= 60000) {
            this.requestsThisMinute = 0;
            this.lastResetTime = now;
        }
    }

    private calculateBackoff(retryCount: number): number {
        // Exponential backoff: 2s, 4s, 8s...
        return this.baseDelayMs * Math.pow(2, retryCount);
    }

    async executeRequest<T>(
        requestFn: () => Promise<T>,
        requestId: string = Math.random().toString(36).substring(7)
    ): Promise<T | null> {
        this.resetCounterIfNeeded();

        if (this.requestsThisMinute >= this.maxRequestsPerMinute) {
            logger.warn(`Rate limit reached, queuing request ${requestId}`);
            return this.queueRequest(requestFn, requestId);
        }

        try {
            this.requestsThisMinute++;
            return await requestFn();
        } catch (error: any) {
            if (error?.message?.includes('rate_limit_exceeded')) {
                logger.warn(`Rate limit hit during request ${requestId}, queuing for retry`);
                return this.queueRequest(requestFn, requestId);
            }
            throw error;
        }
    }

    private async queueRequest<T>(
        requestFn: () => Promise<T>,
        requestId: string
    ): Promise<T | null> {
        return new Promise((resolve) => {
            this.requestQueue.push({
                id: requestId,
                timestamp: Date.now(),
                retryCount: 0,
                execute: async () => {
                    try {
                        let result = await requestFn();
                        resolve(result);
                    } catch (error) {
                        resolve(null);
                    }
                }
            });

            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    private async processQueue(): Promise<void> {
        if (this.processing || this.requestQueue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.requestQueue.length > 0) {
            this.resetCounterIfNeeded();

            if (this.requestsThisMinute >= this.maxRequestsPerMinute) {
                let waitTime = this.calculateBackoff(0);
                logger.info(`Rate limit reached, waiting ${waitTime}ms before next batch`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            let request = this.requestQueue[0];

            try {
                this.requestsThisMinute++;
                await request.execute();
                this.requestQueue.shift();
            } catch (error: any) {
                if (error?.message?.includes('rate_limit_exceeded')) {
                    if (request.retryCount >= this.maxRetries) {
                        logger.error(`Request ${request.id} failed after ${this.maxRetries} retries`);
                        this.requestQueue.shift();
                        continue;
                    }

                    request.retryCount++;
                    let backoffTime = this.calculateBackoff(request.retryCount);
                    logger.info(`Rate limit hit, backing off for ${backoffTime}ms before retry ${request.retryCount}`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                } else {
                    logger.error(`Non-rate-limit error for request ${request.id}: ${error}`);
                    this.requestQueue.shift();
                }
            }
        }

        this.processing = false;
    }

    getQueueLength(): number {
        return this.requestQueue.length;
    }

    getCurrentRequestCount(): number {
        this.resetCounterIfNeeded();
        return this.requestsThisMinute;
    }
}

// Export singleton instance
export let rateLimiter = new RateLimiter(); 