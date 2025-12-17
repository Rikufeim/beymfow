import Layout from "@/components/Layout";
import PromptGenerator from "@/components/PromptGenerator";
import CreditsDisplay from "@/components/CreditsDisplay";

const BusinessPrompts = () => {
  return (
    <>
      <CreditsDisplay />
      <Layout>
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
          <div className="w-full flex flex-col items-center pt-[80px] pb-16 px-4">
            <PromptGenerator />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default BusinessPrompts;
