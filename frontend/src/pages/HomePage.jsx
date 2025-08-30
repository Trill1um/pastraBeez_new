import React, { useState, useEffect, useRef } from "react";

import honey from "../assets/honey-drip.svg";
import imgHero from "../assets/hero-placeholder.jpg";
import placeholder from "../assets/placeholder.png";
import bg_honeycomb from "../assets/bg-honeyComb.svg";
import bg_honey_mobile from "../assets/bg-honey-mobile.svg";
import { div } from "framer-motion/client";

// Figma asset constants
const imgBeeRemovebgPreview3 =
  "http://localhost:3845/assets/5c1f69025ddee607f040bb51fefab0636c716933.png";
const imgBg =
  "http://localhost:3845/assets/73ccc7ebbf6a9123224b4bb04c4ce7b24446fee9.svg";

// Define your images here - just replace these URLs with your actual image paths
const carouselImages = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=600&fit=crop",
];

function ScrollingCarousel({className=""}) {
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef(null);

  const SCROLL_SPEED = 0.5; // pixels per frame
  const ITEM_WIDTH = 192; // 176.75px width + 16px gap (rounded for cleaner math)

  // Continuous scrolling animation
  useEffect(() => {
    const animate = () => {
      setTranslateX((prevX) => {
        const newX = prevX + SCROLL_SPEED;
        // Reset seamlessly when we've scrolled past the first set of images
        const resetPoint = carouselImages.length * ITEM_WIDTH;
        return newX >= resetPoint ? newX - resetPoint : newX;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col gap-2.5 items-start justify-start min-h-px min-w-px overflow-hidden relative shrink-0 flex-3 ${className}`}>
      <div className="flex gap-4 items-center justify-start relative w-full overflow-hidden">
        <div
          className="flex gap-4"
          style={{
            transform: `translateX(-${translateX}px)`,
          }}
        >
          {/* Triple the images for truly seamless infinite scroll */}
          {[...Array(3)].map((_, setIndex) =>
            carouselImages.map((image, i) => (
              <div
                key={`set-${setIndex}-${i}`}
                className={`bg-center bg-cover bg-no-repeat h-full w-${44} lg:w-44 shrink-0 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer`}
                style={{ backgroundImage: `url('${image}')` }}
                onClick={() => console.log(`Clicked image ${i + 1}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const HoneyCell = ({className=""}) => {
  return (
      <div className={`w-[548px] flex items-center justify-center aspect-auto ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg%20width='563'%20height='488'%20viewBox='0%200%20563%20488'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M418.348%20481.095H144.117L7%20243.546L144.117%206H418.348L555.468%20243.546L418.348%20481.095Z'%20stroke='%23F7B81A'%20stroke-width='12'%20fill='none'/%3e%3c/svg%3e")`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="w-9/10 group relative aspect-square"
          style={{
            clipPath:
              "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
          }}
        >
          <div
            className="flex items-center justify-center absolute blur-sm w-full aspect-square -z-10 brightness-50 "
            style={{
              backgroundImage: `url(${imgHero})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              clipPath:
                "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
            }}
          />
          <div className="flex flex-col top-1/4 -left-1 text-white bee-title items-center gap-4 justify-center absolute w-fit">
            <h6 className=" bee-title-h4-desktop w-1/2 text-white text-start">
              Product Name
            </h6>
            <p className="bee-body-h6-desktop w-1/2 text-start">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <button className="btn-anim-transform flex-1 flex items-center w-fit justify-center px-8 py-2 rounded-[0.75rem] border-2">
              <span className="item-button">Learn More</span>
            </button>
          </div>
          <img
            src={imgHero}
            alt=""
            className="lg:group-hover:hidden group- z-10 object-cover w-full transition-all duration-300 ease-out aspect-square"
            style={{
              clipPath:
                "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
            }}
          />
        </div>
      </div>
        

  )
}

const HomePage = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-start justify-start font-fredoka bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-start w-full">
        <div
          className="bg-center bg-cover bg-no-repeat box-border flex flex-col gap-2.5 h-[600px] items-start justify-end px-4 lg:px-16 py-[52px] w-full"
          style={{ backgroundImage: `url('${imgHero}')` }}
        >
          <div className="flex flex-col gap-4 items-center lg:items-start w-full lg:w-fit">
            <h1 className="bee-title-h1-desktop text-center lg:text-start text-white tracking-tight w-fit">
              Borem ipsum dolor sit amet
            </h1>
            <button className="bg-white flex gap-2.5 items-center justify-center px-8 py-4 font-quicksand font-semibold text-active text-[16px] text-center rounded shadow-md hover:bg-amber-100 transition-colors">
              View Hive
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="box-border flex flex-col h-[531px] items-center justify-start w-full">
          <div className="bg-brand justify-center h-fit py-[48px] px-4 lg:px-0 gap-[8px] flex flex-col items-center relative w-full">
            <h2 className="bee-title font-bold text-[24px] lg:bee-title-h4-desktop not-italic w-fit">
              Welcome Busy Beez
            </h2>
            <p className="text-center lg:text-start  lg:bee-body-h6-desktop w-fit">
              Your go-to e-catalog for unique creations, made for students, by
              students.
            </p>
          </div>
          <img
            alt="Welcome Background"
            className="hidden lg:block w-full aspect-auto transform scale-x-[-1]"
            src={honey}
          />
          <img
            alt="Welcome Background"
            className="block lg:hidden w-full aspect-auto"
            src={bg_honey_mobile}
          />
        </div>
      </div>


      {/* Honeycomb Section */}

      <div className="w-full lg:flex hidden items-center justify-center h-[1515px]">
        <div className="bg-blue-300 relative flex flex-col items-center justify-center w-fit h-fit">
          <HoneyCell className="absolute left-[px] top-[-710px]"/>
          <HoneyCell className="absolute left-[125px] top-[-480px]"/>
          <HoneyCell className="absolute left-[125px] top-[-20px]"/>
          <HoneyCell className="absolute left-[-675px] top-[-940px]"/>
          <HoneyCell className="absolute left-[-675px] top-[-17px]"/>
          <HoneyCell className="absolute left-[px] top-[px]"/>
        </div>
      </div>
        

      
      {/* Carousel Section */}
      <div className="box-border content-stretch flex flex-col items-center justify-start relative w-full">
        {/* Background */}
        <div className="bg-brand h-[506px] flex items-center justify-center px-4 lg:px-16 shrink-0 w-full">
          {/* Main content */}
          <div className="flex lg:flex-row flex-col gap-8 items-center w-full">
            {/* Carousel container */}
            <ScrollingCarousel className="order-3 lg:order-1 w-full"/>

            {/* Description */}
            <div className="flex order-2 flex-2 flex-col gap-4 items-start leading-none relative shrink-0 weight text-black w-96">
              <h2 className="font-bold text-4xl bee-title w-full">
                What's in the Hive?
              </h2>
              <p className=" w-full bee-body-h6-desktop opacity-90">
                From the sweetest snacks to the handiest supplies, the hive has
                something for every moment in your day.
              </p>
            </div>
          </div>
        </div>

        <img src={honey} alt="" className="flex w-full" />
      </div>

      <div className="w-full relative">
        {/* CTA Section */}
        <div className="top-[230px] left-[170px] absolute flex flex-col gap-8 items-start z-10 px-8 py-16">
          <div className="flex flex-col gap-4 items-start text-gray-800">
            <h2 className="bee-title-h2-desktop bee-title text-3xl font-bold">
              Want to be Part of the Colony?
            </h2>
            <p className="bee-body-h6-desktop">
              Sign up today—faster than you can say bzzt!
            </p>
          </div>
          <button className="bg-white box-border flex items-center justify-center px-16 py-4 relative border-2 border-gray-800 text-gray-800 shadow-md hover:bg-amber-100 transition-colors whitespace-nowrap font-semibold rounded">
            Sell Now
          </button>
        </div>

        {/* Main BG Image */}
        <div className="relative w-full aspect-auto z-0">
          <img
            alt="Beez Background"
            className="block max-w-none w-full h-full object-cover"
            src={bg_honeycomb}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
