export const createS3Storage = () => {
  return {
    provider: "s3",

    async save() {
      throw new Error("S3 document storage adapter is not configured");
    },

    async delete() {
      throw new Error("S3 document storage adapter is not configured");
    },

    getIngestionLocation() {
      throw new Error("S3 document storage adapter is not configured");
    },
  };
};
