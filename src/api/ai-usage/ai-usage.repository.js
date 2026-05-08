import { AiUsageModel } from "./ai-usage.model.js";

export const aiUsageRepository = {
  create: (usageData) => AiUsageModel.create(usageData),

  findByUser: ({ userId, operation }) =>
    AiUsageModel.find({
      user: userId,
      ...(operation ? { operation } : {}),
    })
      .sort({ createdAt: -1 })
      .exec(),
};
