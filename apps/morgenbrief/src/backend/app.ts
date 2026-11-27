import { createEditionController } from "./edition-controller.js";
import { EditionService } from "./edition-service.js";
import { BundledEditionRepository } from "./bundled-edition-repository.js";

import { DailyEditionFeed } from "./daily-edition-feed.js";

const url = process.env.MORGENBRIEF_FEED_URL;
const repository = new BundledEditionRepository(url ? new DailyEditionFeed(url) : undefined);

export const handleEditionRequest = createEditionController(new EditionService(repository));
