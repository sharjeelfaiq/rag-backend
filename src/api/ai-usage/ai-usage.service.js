import { aiUsageRepository } from "./ai-usage.repository.js";

const serializeUsage = (usage) =>
  typeof usage?.toObject === "function" ? usage.toObject() : usage;

export const createAiUsageService = ({ repository }) => ({
  listUsage: async ({ userId, operation }) => {
    const usage = await repository.findByUser({ userId, operation });
    return {
      status: "success",
      message: "AI usage retrieved successfully",
      data: usage.map(serializeUsage),
    };
  },
});

export const aiUsageService = createAiUsageService({
  repository: aiUsageRepository,
});
