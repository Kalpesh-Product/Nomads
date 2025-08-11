import React from "react";
import Container from "../../components/Container";

const HostHome = () => {
  return (
    <main>
      <section className="bg-[#f7feec]">
        <Container>
          <div className="flex justify-center items-center ">
            <div className="mb-0 lg:mb-20 w-full">
              <h1 className="font-semibold text-[clamp(1rem,6.5vw,7rem)]">
                Introducing
              </h1>{" "}
            </div>
            <div className="leading-normal w-full">
              <div className="relative">
                <h1 className="font-semibold text-[clamp(1rem,6.3vw,6rem)] text-nowrap">
                  N-Commerce
                </h1>
                <img className="absolute w-full -bottom-6 left-0 h-1/2" src="/blue-line.png" alt="underline" />
              </div>
              <p className="text-[clamp(1rem,3.2vw,3rem)]">
                "<span>Wo</span>rld <span>No</span>mad <span>Co</span>mmerce"
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start gap-3">
            <p className="text-title">A simple NO CODE SaaS Platform.</p>
            <p className="text-content">
              We support businesses in small and aspiring destinations which
              host Nomads!
            </p>
            <p className="text-content">
              SaaS Tech for Nomad supoorting businesses across the world.
              <span className="font-medium">
                (Example: Co-Working, Co-Living, Hostels, Workations, Resorts,
                Cafes, Events etc)
              </span>
            </p>
          </div>
        </Container>
      </section>
      <section>globe</section>
      <section>key modules</section>
      <section>one partner platform</section>
      <section>no code self </section>
      <section>testimonial</section>
    </main>
  );
};

export default HostHome;
