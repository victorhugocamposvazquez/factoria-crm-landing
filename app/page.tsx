import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Manifesto from "@/components/sections/Manifesto";
import ExplodedView from "@/components/sections/ExplodedView";
import Immersion from "@/components/sections/Immersion";
import Process from "@/components/sections/Process";
import Devices from "@/components/sections/Devices";
import Pieces from "@/components/sections/Pieces";
import Compare from "@/components/sections/Compare";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <Marquee />
      <Manifesto />
      <ExplodedView />
      <Immersion />
      <Process />
      <Devices />
      <Pieces />
      <Compare />
      <Pricing />
      <Faq />
      <Cta />
    </main>
  );
}
