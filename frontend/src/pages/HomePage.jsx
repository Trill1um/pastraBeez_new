import { useState, useEffect, useRef } from "react";
import {
  useFeaturedProducts,
  useUniqueProductCategories,
} from "../stores/useProductStore";
import { useNavigate, useLocation } from "react-router-dom";
import cloudify from "../lib/cloudify";

import honey from "../assets/bg-drip.svg";
import imgHero from "../assets/placeholder.png";
import bg_honeycomb from "../assets/bg-comb.svg";
import bg_honey_mobile from "../assets/bg-drip-mobile.svg";
import bg_comb_mobile from "../assets/bg-comb-mobile.svg";
import HomeBg from "../components/HomeBg";
import hive from "../assets/bee-hive.webp";
import { FlyingBee } from "../components/FlyingBee";

function ScrollingCarousel({ className = "", products, location }) {
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  const onNav = (id) => {
    navigate(`/product/${id}`, { state: { from: location } });
  };

  const SCROLL_SPEED = 1;
  const ITEM_WIDTH = 292;

  const seamlessProducts = [...products, ...products];
  const totalWidth = seamlessProducts.length * ITEM_WIDTH;

  useEffect(() => {
    const animate = () => {
      setTranslateX((prevX) => {
        const newX = prevX + SCROLL_SPEED;
        return newX >= totalWidth / 2 ? newX - totalWidth / 2 : newX;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [totalWidth]);

  return (
    <div
      className={`flex flex-col gap-2.5 items-start justify-start min-h-px h-full min-w-px overflow-hidden relative shrink-0 flex-3 ${className}`}
    >
      <div className="flex gap-4 items-center justify-start relative w-full h-full overflow-hidden">
        <div
          className="flex h-full gap-4"
          style={{
            transform: `translateX(-${translateX}px)`,
            width: `${totalWidth}px`,
          }}
        >
          {seamlessProducts.map((p, i) => (
            <div
              onClick={() => {
                onNav(p._id);
              }}
              key={`carousel-${p._id}-${i}`}
              className={`bg-center bg-cover hover:brightness-90 bg-no-repeat h-full w-[292px] shrink-0 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer`}
              style={{
                backgroundImage: `url(${cloudify(
                  p.images[0],
                  "detail",
                  false
                )})`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const HoneyCell = ({ className = "", product = [], location = "" }) => {
  const navigate = useNavigate();
  console.log("product:", product);
  return (
    <div
      className={`w-[228px] sm:w-[387px] xl:w-[548px] select-none flex items-center justify-center aspect-auto ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg%20width='563'%20height='488'%20viewBox='0%200%20563%20488'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M418.348%20481.095H144.117L7%20243.546L144.117%206H418.348L555.468%20243.546L418.348%20481.095Z'%20stroke='%23F7B81A'%20stroke-width='12'%20fill='none'/%3e%3c/svg%3e")`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {product && location ? (
        <div
          className="w-9/10 group flex items-center justify-center relative aspect-square"
          style={{
            clipPath:
              "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
          }}
        >
          {/* Cover */}
          <img
            src={product?.images[0] || imgHero}
            alt={product?.name || "Product Image"}
            className="lg:group-hover:opacity-0 lg:group-hover:pointer-events-none z-10 object-cover w-full transition-all duration-300 ease-out aspect-square"
            style={{
              clipPath:
                "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
            }}
          />

          {/* Background Img */}
          <div
            className="flex items-center justify-center absolute blur-sm w-full aspect-square -z-10 brightness-50 "
            style={{
              backgroundImage: `url(${product?.images[0] || imgHero})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              clipPath:
                "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
            }}
          />

          {/* Content */}
          <div className="flex flex-col text-white bee-title items-end  gap-4 justify-center absolute w-4/7">
            <div className="flex flex-col w-full items-start gap-2">
              <h6 className="line-clamp-2 bee-title-h4-desktop text-white text-start">
                {product?.name || "Product Name"}
              </h6>
              <p className="line-clamp-3 bee-body-h6-desktop text-start">
                {product?.description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
              </p>
            </div>
            <button
              onClick={() => {
                navigate(`/product/${product?._id}`, {
                  state: { from: location },
                });
              }}
              className="btn-anim-transform flex-1 flex items-center w-fit justify-center px-8 py-2 rounded-[0.75rem] border-2"
            >
              <span className="item-button">Learn More</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="w-9/10 group flex items-center justify-center relative aspect-square"
          style={{
            clipPath:
              "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
          }}
        >
          <div
            style={{
              clipPath:
                "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
            }}
            className={`${
              Math.random() - 0.5 > 0 ? "bg-yellow-300" : "bg-[#f7b81a]"
            } w-full h-full`}
          />
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uniqueProducts = useUniqueProductCategories().uniqueProducts;
  const featuredProducts = useFeaturedProducts().featuredProducts;

  console.log("featuredProducts:", featuredProducts);

  const coordinates = [
    `
    absolute 
    xl:top-[-250px] xl:left-[-272px]
    lg:top-[-193px] lg:left-[-193px]
    sm:top-[-490px] sm:left-[-345px] 
    top-[-490px] left-[-195px] 
    `,
    // bg-red-300
    `
    absolute 
    xl:top-[-710px] xl:left-[-270px]
    lg:top-[-520px] lg:left-[-193px]
    sm:top-[-326px] sm:left-[-60px] 
    top-[-394px] left-[-30px] 
    `,
    // bg-orange-300
    // hidden
    `
    absolute 
    xl:left-[125px] xl:top-[-480px]
    lg:top-[-358px] lg:left-[90px]
    sm:top-[166px] sm:left-[-344px] 
    top-[-105px] left-[-195px] 
    `,
    // bg-yellow-300
    // hidden
    `
    absolute 
    xl:left-[125px] xl:top-[-20px]
    lg:top-[-30px] lg:left-[90px]
    sm:top-[329px] sm:left-[-60px] 
    top-[-9px] left-[-30px] 
    //bg-green-300 
    `,
    // hidden

    `
    absolute top-[88px] left-[-195px] 
    xl:left-[-675px] xl:top-[-17px]
    lg:top-[-30px] lg:left-[-478px]
    sm:top-[496px] sm:left-[-344px] 
    //bg-blue-300
    `,
    // hidden

    `
    absolute top-[377px] left-[-30px] 
    xl:left-[-675px] xl:top-[-940px]
    lg:top-[-686px] lg:left-[-478px]
    sm:top-[984px] sm:left-[-60px] 
    //bg-purple-300
    `,
    // hidden
  ];

  const coordinatesEmpty = [
    `absolute 
    lg:hidden lg:pointer-events-none
    sm:bottom-[304px] sm:left-[-60px] 
    bottom-[-4px] left-[-30px] 
    `,

    `absolute 
    bottom-[93px] left-[-195px] 
    sm:bottom-[-186px] sm:left-[-344px] 
    lg:hidden lg:pointer-events-none`,

    `absolute 
    bottom-[380px] left-[-30px] 
    sm:bottom-[-350px] sm:left-[-60px] 
    lg:hidden lg:pointer-events-none`,

    `absolute 
    bottom-[-390px] left-[-30px] 
    sm:bottom-[-1005px] sm:left-[-60px] 
    sm:pointer-events-none`,

    `absolute 
    bottom-[-486px] left-[-195px] 
    sm:bottom-[-1170px] sm:left-[-344px] 
    sm:pointer-events-none`,
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-start justify-start font-fredoka bg-white overflow-hidden">
      <HomeBg />
      {/* Hero Section */}
      <div className="flex relative flex-col items-center justify-start w-full">
        <div className="bg-white bg-center flex flex-col lg:flex-row bg-cover bg-no-repeat box-border h-fit lg:h-[600px] items-center justify-between px-4 gap-24 lg:px-16 py-[52px] w-full">
          <div className="flex gap-8 order-1 z-1 lg:order-0 flex-col items-center lg:items-start w-full lg:w-1/2">
            <div className="flex flex-col gap-4 items-center lg:items-start w-7/8 lg:w-full">
              <h1 className="bee-title-h2 text-center lg:text-start tracking-tight w-fit">
                Bee-Inspired, Student-Made Essentials
              </h1>
              <p className="bee-body-h6 text-center lg:text-start tracking-tight w-full">
                Where craftsmanship meets purpose—discover items crafted with
                care, by students, for students
              </p>
            </div>
            <button className="flex btn-anim btn-primary active:scale-95 gap-2.5 items-center justify-center px-8 py-4 text-center rounded shadow-md">
              View Hive
            </button>
          </div>
          <div className="flex h-full w-1/2 z-0 items-center justify-center relative">
            <div className="h-4/3 bg-yellow-200 absolute z-0 rounded-full aspect-square" />
            <div className="h-1/1 bg-yellow-400 absolute z-0 rounded-full aspect-square" />
            <img className="relative h-full" src={hive} alt="bee hive z-1" />
          </div>
        </div>

        {/* Welcome Section */}
        <div className="drop-shadow-2xl box-border flex flex-col h-[531px] items-center justify-start w-full">
          <div className="bg-brand justify-center h-fit py-[48px] px-4 lg:px-0 gap-[8px] flex flex-col items-center relative w-full">
            <h2 className="bee-title font-bold text-[24px] lg:bee-title-h4-desktop not-italic w-fit">
              Welcome Busy Beez
            </h2>
            <p className="text-center lg:text-start bee-body-h6-desktop w-fit">
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
      <div className="relative drop-shadow-2xl w-full flex pt-140 pb-200 sm:pt-200 sm:pb-400 lg:py-0 items-center justify-center h-fit lg:h-[1515px]">
        <div className="bg-blue-700 lg:relative absolute flex flex-col items-center justify-center w-fit h-fit">
          {Array.from({ length: 6 }, (_, index) => {
            return (
              <HoneyCell
                key={`honey-cell-${featuredProducts[index]?._id || index}`}
                className={coordinates[index]}
                product={featuredProducts[index] || null}
                location={location}
              />
            );
          })}
        </div>
        <div className="lg:relative absolute lg:hidden flex flex-col items-center justify-center z-0 w-fit h-fit">
          {Array.from({ length: coordinatesEmpty.length }, (_, index) => {
            return (
              <HoneyCell
                key={`honey-cell-${Date.now()}-${index}`}
                className={coordinatesEmpty[index]}
              />
            );
          })}
        </div>
      </div>

      {/* Carousel Section */}
      {uniqueProducts.length && (
        <div className="box-border content-stretch flex flex-col items-center justify-start relative w-full">
          {/* Background */}

          <div className="drop-shadow-2xl z-10 flex flex-col w-full ">
            <div className="bg-brand h-[800px] lg:h-[506px] py-18 flex items-center justify-center px-4 lg:px-16 shrink-0 w-full">
              {/* Main content */}
              <div className="flex lg:flex-row h-full flex-col gap-8 items-center w-full">
                {/* Carousel container */}
                <ScrollingCarousel
                  className="order-3 lg:order-1 w-full"
                  products={uniqueProducts}
                  location={location}
                />

                {/* Description */}
                <div className="flex order-2 flex-1 lg:flex-2 flex-col gap-4 lg:items-start items-center leading-none relative text-black w-full lg:w-96">
                  <h2 className="bee-title-h2 text-center lg:text-start w-fit">
                    What's in the Hive?
                  </h2>
                  <p className="bee-body-h6 text-center lg:text-start w-fit">
                    From the sweetest snacks to the handiest supplies, the hive
                    has something for every moment in your day.
                  </p>
                </div>
              </div>
            </div>
            <img
              alt="Welcome Background"
              className="hidden lg:block w-full z-10  aspect-auto transform scale-x-[-1]"
              src={honey}
            />
            <img
              alt="Welcome Background"
              className="block lg:hidden w-full z-10 aspect-auto"
              src={bg_honey_mobile}
            />
            {/* <img src={honey} alt="" className="z-10 flex w-full" /> */}
          </div>
        </div>
      )}

      <div className="w-full mt-[128px] lg:mt-0 z-20 relative">
        {/* CTA Section */}
        <div
          className="lg:top-[16%] lg:left-[11.3vw]
          w-4/5
          sm:w-3/5
          lg:w-auto
          left-1/2 -translate-x-1/2
          lg:-translate-x-0
          -top-1/4
          sm:-top-1/7
          absolute flex flex-col gap-8 items-center lg:items-start z-20"
        >
          <div className="flex text-center lg:text-left flex-col gap-4 text-gray-800">
            <h2 className="bee-title-h2 font-bold">
              Want to be Part of the Colony?
            </h2>
            <p className="bee-body-h6">
              Sign up today—faster than you can say bzzt!
            </p>
          </div>
          <button
            onClick={() => {
              navigate("/SellerPage");
            }}
            className="btn-primary btn-anim rounded-2xl box-border flex items-center justify-center px-8 py-2 lg:px-16 lg:py-4 relative border-2 shadow-md hover:bg-amber-100 whitespace-nowrap font-semibold"
          >
            Sell Now
          </button>
          <FlyingBee style={`absolute w-20 lg:w-40 aspect-auto left-2/3 lg:right-0 lg:left-45 rotate-10 lg:top-30 top-9/10 z-0 -scale-x-100 max-w-full h-auto pointer-events-none`} />
        </div>
        <div />

        {/* Main BG Image */}
        <div className="relative w-full aspect-auto">
          <img
            alt="Beez Background"
            className="lg:block relative hidden max-w-none w-full h-full z-10 object-cover"
            src={bg_honeycomb}
          />
          <img
            alt="Beez Background"
            className="lg:hidden relative block max-w-none w-full  h-full z-10 object-cover"
            src={bg_comb_mobile}
          />
          <FlyingBee style={"absolute lg:block w-70 hidden left-10 top-1/3 z-0"} />
          <FlyingBee style={"hidden lg:block absolute w-70 aspect-auto left-4/9 top-2/5 z-0 -scale-x-100"} />
          <FlyingBee style={"hidden lg:block absolute w-70 aspect-auto left-1/2 -top-1/10 z-0 rotate-10 -scale-x-100"} />
          <FlyingBee style={"absolute w-20 sm:w-40 lg:w-70 aspect-auto lg:right-7  left-1/12 top-5 lg:-top-1/10 z-0 block"} />
          <FlyingBee style={"absolute w-40 aspect-auto top-1/4 right-1/5 lg:right-10 lg:top-8/19 z-0 -scale-x-100 "} />
          <FlyingBee style={"hidden lg:block absolute w-30 aspect-auto left-4/5 top-2/11 z-0"} />
          <FlyingBee style={"-scale-x-100 lg:scale-x-100 absolute w-30 lg:w-60 aspect-auto right-15 sm:right-3/8 lg:right-1/1000 -top-55 rotate-15 lg:rotate-0 sm:-top-60 lg:top-1/2 z-0"} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
