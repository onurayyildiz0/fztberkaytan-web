import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero imageSrc="/home.avif" />
        <Services />
        <About />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
