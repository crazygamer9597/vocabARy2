import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import VocabularyListManager from "@/components/vocabulary/VocabularyListManager";

export default function VocabularyLists() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <VocabularyListManager />
      </main>
      
      <Footer />
    </div>
  );
}