import { realtimeInfoService } from '.';
import { logger } from '../../utils/logger';

async function testRealtimeInfo() {
    logger.info("🌟 Starting Manual RealtimeInfo Service Tests 🌟\n");

    try {
        logger.info("Test 1: Getting info about Tesla stock");
        let teslaResults = await realtimeInfoService.getInfo("what is tesla stock price");
        console.log("Tesla Results:", JSON.stringify(teslaResults, null, 2));
        logger.success("✅ Tesla test completed\n");

        logger.info("Test 2: Getting weather information");
        let weatherResults = await realtimeInfoService.getInfo("what is the weather in New York");
        console.log("Weather Results:", JSON.stringify(weatherResults, null, 2));
        logger.success("✅ Weather test completed\n");

        logger.info("Test 3: Testing with invalid query");
        let invalidResults = await realtimeInfoService.getInfo("");
        console.log("Invalid Query Results:", JSON.stringify(invalidResults, null, 2));
        logger.success("✅ Invalid query test completed\n");

    } catch (error) {
        logger.error(`❌ Test failed: ${error}`);
    }

    logger.success("✨ All manual tests completed! ✨");
}

testRealtimeInfo().catch(error => {
    logger.error(`Test suite failed: ${error}`);
    process.exit(1);
}); 