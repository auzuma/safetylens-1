import { realtimeInfoService } from '.';
import { logger } from '../../utils/logger';
import { duckDuckGoService } from '../duckDuckGo';

async function testRealtimeInfo() {
    logger.info("🌟 Starting Manual RealtimeInfo Service Tests 🌟\n");

    try {
        logger.info("Test 1: Getting info about Tesla stock");
        logger.info("Sending query to service...");

        // Test DuckDuckGo directly first
        logger.info("Testing DuckDuckGo service directly...");
        try {
            let directDdgResults = await duckDuckGoService.search("tesla stock price");
            logger.info("Direct DuckDuckGo results: " + JSON.stringify(directDdgResults, null, 2));
        } catch (ddgError) {
            logger.error("DuckDuckGo direct test failed: " + JSON.stringify(ddgError, null, 2));
        }

        let teslaResults = await realtimeInfoService.getInfo("what is tesla stock price");
        logger.info("Raw response from Groq: " + JSON.stringify(await realtimeInfoService['optimizeQuery']("what is tesla stock price"), null, 2));
        logger.info("DuckDuckGo response: " + JSON.stringify(await realtimeInfoService['getDuckDuckGoData']("tesla stock price"), null, 2));
        console.log("Tesla Results:", JSON.stringify(teslaResults, null, 2));
        logger.success("✅ Tesla test completed\n");

        logger.info("Test 2: Getting weather information");
        logger.info("Sending query to service...");

        // Test DuckDuckGo directly first
        logger.info("Testing DuckDuckGo service directly...");
        try {
            let directDdgResults = await duckDuckGoService.search("weather in New York");
            logger.info("Direct DuckDuckGo results: " + JSON.stringify(directDdgResults, null, 2));
        } catch (ddgError) {
            logger.error("DuckDuckGo direct test failed: " + JSON.stringify(ddgError, null, 2));
        }

        let weatherResults = await realtimeInfoService.getInfo("what is the weather in New York");
        logger.info("Raw response from Groq: " + JSON.stringify(await realtimeInfoService['optimizeQuery']("what is the weather in New York"), null, 2));
        logger.info("DuckDuckGo response: " + JSON.stringify(await realtimeInfoService['getDuckDuckGoData']("weather in New York"), null, 2));
        console.log("Weather Results:", JSON.stringify(weatherResults, null, 2));
        logger.success("✅ Weather test completed\n");
    } catch (error) {
        logger.error(`❌ Test failed: ${error}`);
    }

    logger.success("✨ All manual tests completed! ✨");
}

testRealtimeInfo().catch(error => {
    logger.error(`Test suite failed: ${error}`);
    process.exit(1);
});