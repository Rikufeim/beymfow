import Header from "@/components/Header";
import PromptGenerator from "@/components/PromptGenerator";
import CreditsDisplay from "@/components/CreditsDisplay";
import Footer from "@/components/Footer";

const BusinessPrompts = () => {
  return (
    <>
      <CreditsDisplay />
      <div className="min-h-screen bg-black text-white flex flex-col items-center">
        <Header />
        
        <div className="w-full flex flex-col items-center pt-[160px] pb-16 px-4">
          <PromptGenerator />
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default BusinessPrompts;
