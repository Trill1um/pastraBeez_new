import { useState, useEffect } from "react";

// Tinamad na, antok na ko huhuhu

import imgHero from "../assets/placeholder.png";
import HomeBg from "../components/HomeBg";
import bg_drip from "../assets/bg-drip.svg";
import bg_drip_mobile from "../assets/bg-drip-mobile.svg";
import team from "../assets/team.webp";
import kevin from "../assets/kevin.webp";
import jamilla from "../assets/jamilla.webp";
import jhon from "../assets/jhon.webp";
import rhyza from "../assets/rhyza.webp";

const LargeHoneycombSection = ({ title, content, position = "left" }) => {
  const isLeft = position === "left";

  return (
    <div className={`${isLeft ? "-left-1/4 lg:-left-1/8" : "right-1/50 md:-right-1/5 lg:-right-1/3 xl:-right-1/2"} max-w-[900px] relative w-9/7 xl:w-2/3 aspect-square flex justify-center`}>
      {/* Honeycomb positioned left or right */}
      <div
        className={`absolute top-0 h-full aspect-square w-full z-10`}
      >
        {/* Honeycomb background with outline */}
        <div
          className="w-full h-full select-none flex items-center justify-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg%20width='563'%20height='488'%20viewBox='0%200%20563%20488'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M418.348%20481.095H144.117L7%20243.546L144.117%206H418.348L555.468%20243.546L418.348%20481.095Z'%20stroke='%23F7B81A'%20stroke-width='12'%20fill='none'/%3e%3c/svg%3e")`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Filled honeycomb interior */}
          <div
            className={`${
              Math.random() - 0.5 > 0 ? "bg-yellow-300" : "bg-[#f7b81a]"
            } 
            w-9/10 
            h-auto flex itemss-center justify-center
            sm:p-30 xl:p-50 
            aspect-square`}
            style={{
              clipPath:
                "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
            }}
          >
            {/* Content hidden for now as requested */}
            <div className="flex flex-col w-1/2 sm:w-2/3 md:w-4/7 lg:w-5/6 gap-6 lg:gap-8 xl:w-1/1 text-black sm:items-start sm:text-start items-center text-center justify-center h-full">
              <h3 className="text-center bee-title font-bold text-[clamp(1.25rem,3vw,2.25rem)]">{title}</h3>
              <p className="bee-title text-[clamp(0.975rem,3.5vw,1.375rem)]">{content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamMemberCard = ({
  name,
  index,
  role,
  description,
  image,
  delay = "0s",
}) => {
  return (
    <div
      className={`${
        index % 2 == 0 ? "hover:-rotate-1" : "hover:rotate-1"
      } flex-1 bee-grad${
        index % 2 != 0 ? "-reverse" : ""
      } w-full rounded-3xl lg:rounded-[25px] p-12 lg:p-8 hover:scale-105 transition-all duration-500 group`}
      style={{ animationDelay: delay }}
    >
      <div className="flex gap-6 flex-col lg:flex-row lg:gap-8 items-center h-full">
        {/* Avatar with bee decoration */}
        <div className="relative flex items-center justify-center">
          <div className="aspect-square max-w-2/3 lg:max-w-1/1 w-full lg:h-100 rounded-2xl overflow-hidden bg-orange shadow-lg">
            <img
              src={image || imgHero}
              alt={name}
              className="w-full  h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 lg:w-12 lg:h-12 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        </div>
        <div
          className={`${
            index % 2 != 0 ? "lg:order-first" : "lg:order-last"
          } text-center flex-1 flex flex-col items-center justify-between`}
        >
          <h4 className="bee-title-h3-desktop mb-4">{name}</h4>
          {role && (
            <p className="bee-body-h6 font-semibold text-orange mb-4">{role}</p>
          )}
          <p className="bee-body-h6">{description}</p>
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const teamMembers = [
    {
      name: "Kevin Menard Fernandez",
      role: "Lead Beekeeper",
      description:
        "I am Kevin Menard V. Fernandez, and I want to help young entrepreneurs promote their products by supporting their fresh ideas and nurturing their potential for success. I believe that giving them opportunities to grow will not only benefit their businesses but also inspire more students to pursue entrepreneurship with confidence.",
      image: kevin,
    },
    {
      name: "Rhyza Jen D. Rañola",
      role: "Hive Architect & Designer",
      description:
        "I am Rhyza Jen D. Rañola, inspired to conduct this research after seeing many fellow student entrepreneurs struggle with promotion, which led me to create a digital catalogue through PastraBeez to help them showcase their products more effectively and reach their target customers.",
      image: rhyza,
    },
    {
      name: "Jhon Lester F. Gallardo",
      role: "Colony Coordinator",
      description:
        "I am Jhon Lester F. Gallardo, and I want to help young student entrepreneurs in our school by providing them with ideas and support through this research, hoping to inspire them to keep going and always do their best. I believe that with the right guidance and encouragement, they can turn their small businesses into bigger opportunities for success.",
      image: jhon,
    },
    {
      name: "Jamilla D. Aman",
      role: "Product Curator",
      description:
        "I am Jamilla D. Aman, motivated by my passion for business to empower young student entrepreneurs through exploring how digital tools can support and promote their ventures.",
      image: jamilla,
    },
  ];

  return (
    <div className=" bg-neutral-50 flex flex-col gap-16 lg:gap-32 items-center relative w-full min-h-screen font-fredoka overflow-hidden">
      <HomeBg />

      {/* Hero Section - Desktop Layout */}
      <div className="relative w-full flex flex-col items-end z-10">
        {/* Dark background header */}
        <div className="bg-black flex flex-col h-180 md:h-200 lg:h-[571px] items-center overflow-hidden relative w-full">
          <div className="absolute inset-0 w-full h-3/2">
            <img
              src={team}
              alt=""
              className="absolute inset-0 w-full xl:h-full object-cover opacity-50 h-full pointer-events-none"
            />
          </div>
        </div>

        <div className="w-full h-45 lg:h-60 2xl:h-100 bg-yellow-300" />
        <img
          src={bg_drip}
          className="hidden lg:block w-full max-w-[1536px] -scale-x-100"
          alt=""
        />
        <img
          src={bg_drip_mobile}
          className="block lg:hidden w-full max-w-[1536px] -scale-x-100"
          alt=""
        />

        {/* Floating content card */}
        <div
          className="left-1/2 max-w-[1536px] -translate-x-1/2 absolute bottom-1/4 sm:bottom-2/7 md:bottom-1/3 lg:bottom-1/3 xl:bottom-2/5 w-9/10 sm:w-5/6 md:w-4/5 lg:w-3/4 xl:w-5/6 bg-neutral-50 rounded-2xl sm:rounded-3xl lg:rounded-[25px] shadow-2xl"
        >
          <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 flex-col lg:flex-row h-full items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
            {/* Text Content */}
            <div className="flex-1 order-2 lg:order-1 flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-black">
              <h1 className="text-center md:text-left font-bold bee-title text-[clamp(1.5rem,4vw,2.5rem)]">
                About Us
              </h1>
              <p className="text-center md:text-left text-[clamp(0.875rem,2.5vw,1.25rem)] leading-relaxed">
                We are a group of passionate students on a mission to showcase
                the ingenuity and talent of young creators. Our bee-themed
                e-catalog is a digital hive, filled with handcrafted goods,
                innovative ideas, and unique products made by students for the
                community. Every item in our catalog tells a story — of hard
                work, creativity, and the spirit of learning.
              </p>
            </div>

            {/* Image */}
            <div className="flex-shrink-0 w-full sm:w-4/5 md:w-3/4 lg:w-2/5 xl:w-1/2 order-1 lg:order-2">
              <img
                src={team}
                alt="About Us"
                className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] object-cover object-center md:object-right rounded-xl lg:rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full z-10 py-8 gap-20 flex flex-col lg:py-16 xl:py-24">
        <LargeHoneycombSection
          title="Our Mission"
          content="Our mission is to establish a sustainable digital platform that empowers student entrepreneurs to present their products professionally, reach appropriate audiences, and develop practical business skills. We aim to foster measurable growth and responsible enterprise among student creators."
          position="left"
        />

        <LargeHoneycombSection
          title="Research Objectives"
          content="Our objectives is to use the website as an empirical platform to measure how a centralized digital catalogue affects product visibility, user engagement, and market access for student entrepreneurs."
          position="right"
        />

        <LargeHoneycombSection
          title="Our Values"
          content="We are guided by integrity, inclusivity, quality, and sustainability. We commit to supporting student creators with transparent practices, equitable exposure, high standards of presentation, and an emphasis on environmentally and socially responsible entrepreneurship."
          position="left"
        />
      </div>
      <div
        className={`w-full px-8 lg:px-16 py-16 z-10 transform transition-all duration-1000 delay-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-8 lg:gap-16 max-w-7xl mx-auto">
          <h2 className="bee-title-h2">Meet the Beekeepers</h2>

          {/* Desktop: Horizontal layout, Mobile: Grid layout */}
          <div className="flex flex-col gap-6 lg:gap-8 items-stretch">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={"index-" + index}
                index={index}
                {...member}
                delay={`${1.2 + index * 0.2}s`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
