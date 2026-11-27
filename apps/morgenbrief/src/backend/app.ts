import { createEditionController } from "./edition-controller.js";
import { EditionService } from "./edition-service.js";
import { BundledEditionRepository } from "./bundled-edition-repository.js";

export const handleEditionRequest = createEditionController(new EditionService(new BundledEditionRepository()));
