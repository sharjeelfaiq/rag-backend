import { aiUsageRepository } from "./ai-usage.repository.js";

const serializeUsage = (usage) =>
  typeof usage?.toObject === "function" ? usage.toObject() : usage;

export const aiUsageService = {
  listUsage: async ({ userId, operation }) => {
    const usage = await aiUsageRepository.findByUser({ userId, operation });
    return {
      status: "success",
      message: "AI usage retrieved successfully",
      data: usage.map(serializeUsage),
    };
  },
};
