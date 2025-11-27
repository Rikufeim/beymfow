import Layout from "@/components/Layout";

const ImagePrompts = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black chrome-text mb-8">
            Image Prompts
          </h1>
          <p className="text-muted-foreground text-lg">
            Create stunning AI images
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ImagePrompts;
