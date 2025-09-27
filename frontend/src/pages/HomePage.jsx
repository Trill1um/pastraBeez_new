import { useState, useEffect, useRef } from "react";
import { useFeaturedProducts, useUniqueProductCategories } from "../stores/useProductStore";
import { useNavigate, useLocation } from "react-router-dom";
import cloudify from "../lib/cloudify";

import honey from "../assets/honey-drip.svg";
import imgHero from "../assets/placeholder.png";
import bg_honeycomb from "../assets/bg-honeyComb.svg";
import bg_honey_mobile from "../assets/bg-honey-mobile.svg";
import bee from "../assets/new_bee.gif"

import HomeBg from "../components/HomeBg";

function ScrollingCarousel({ className = "", products, location }) {
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  const onNav = (id) => {
    navigate(`/product/${id}`, {state: {from: location}});
  }

  const SCROLL_SPEED = 0.5;
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
              onClick={()=>{onNav(p._id)}}
              key={`carousel-${p._id}-${i}`}
              className={`bg-center bg-cover hover:brightness-90 bg-no-repeat h-full ${"w-[" + ITEM_WIDTH + "px]"} shrink-0 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer`}
              style={{ backgroundImage: `url(${cloudify(p.images[0], "detail", false)})` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const HoneyCell = ({ className = "", product }) => {
  return (
    <div
      className={`w-[548px] select-none flex items-center justify-center aspect-auto ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg%20width='563'%20height='488'%20viewBox='0%200%20563%20488'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M418.348%20481.095H144.117L7%20243.546L144.117%206H418.348L555.468%20243.546L418.348%20481.095Z'%20stroke='%23F7B81A'%20stroke-width='12'%20fill='none'/%3e%3c/svg%3e")`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="w-9/10 group flex items-center justify-center relative aspect-square"
        style={{
          clipPath:
            "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
        }}
      >
        <img
          src={product?.images[0] || imgHero}
          alt={product?.name || "Product Image"}
          className="lg:group-hover:opacity-0 lg:group-hover:pointer-events-none z-10 object-cover w-full transition-all duration-300 ease-out aspect-square"
          style={{
            clipPath:
              "polygon(25.6% 6.2%, 74.3% 6.2%, 100% 49.9%, 74.3% 93.6%, 25.6% 93.6%, 0% 49.9%)",
          }}
        />
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
        <div className="flex flex-col text-white bee-title items-end  gap-4 justify-center absolute w-4/7">
          <div className="flex flex-col items-start gap-2">
            <h6 className="honey-cell-name bee-title-h4-desktop text-white text-start">
              {product?.name || "Product Name"}
            </h6>
            <p className="honey-cell-desc bee-body-h6-desktop text-start">
              {product?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
            </p>
          </div>
          <button className="btn-anim-transform flex-1 flex items-center w-fit justify-center px-8 py-2 rounded-[0.75rem] border-2">
            <span className="item-button">Learn More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const isProduction = import.meta.env.MODE === "production";

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {uniqueProducts, isUniqueLoading, uniqueError} = useUniqueProductCategories();
  const {featuredProducts, isFeaturedLoading, featuredError} = useFeaturedProducts();
  useEffect(() => {
    console.log("Featured: ", featuredProducts);
    console.log("Unique: ", uniqueProducts);

  }), [];
  const coordinates=[
    "absolute",
    "absolute left-[125px] top-[-480px]",
    "absolute top-[-710px]",
    "absolute left-[125px] top-[-20px]",
    "absolute left-[-675px] top-[-17px]",
    "absolute left-[-675px] top-[-940px]"
  ]
  return (
    <>
      {isProduction ? (
        <div className="min-h-screen w-full flex items-center justify-center">
          <h1 className="bee-logo-desktop text-4xl text-yellow-700">
            Home Page Coming Soon!
          </h1>
        </div>
      ) : (
        <div className="relative w-full min-h-screen flex flex-col items-start justify-start font-fredoka bg-white overflow-hidden">
          <HomeBg />
          {/* Hero Section */}
          <div className="flex relative flex-col items-center justify-start w-full">
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
            <div className="drop-shadow-2xl box-border flex flex-col h-[531px] items-center justify-start w-full">
              <div className="bg-brand justify-center h-fit py-[48px] px-4 lg:px-0 gap-[8px] flex flex-col items-center relative w-full">
                <h2 className="bee-title font-bold text-[24px] lg:bee-title-h4-desktop not-italic w-fit">
                  Welcome Busy Beez
                </h2>
                <p className="text-center lg:text-start bee-body-h6-desktop w-fit">
                  Your go-to e-catalog for unique creations, made for students,
                  by students.
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

          <div className="relative drop-shadow-2xl w-full lg:flex hidden items-center justify-center h-[1515px]">
            <div className="bg-blue-300 relative flex flex-col items-center justify-center w-fit h-fit">
              {featuredProducts?.map((product, index) => {
                return <HoneyCell key={`honey-cell-${product._id}`} className={coordinates[index]} product={product} location={location} />
              })}
            </div>
          </div>

          {/* Carousel Section */}
          <div className="box-border content-stretch flex flex-col items-center justify-start relative w-full">
            {/* Background */}

            <div className="drop-shadow-2xl z-10 flex flex-col w-full ">
              <div className="bg-brand h-[506px] py-18 flex items-center justify-center px-4 lg:px-16 shrink-0 w-full">
                {/* Main content */}
                <div className="flex lg:flex-row h-full flex-col gap-8 items-center w-full">
                  {/* Carousel container */}
                  <ScrollingCarousel className="order-3 lg:order-1 w-full" products={uniqueProducts} location={location} />

                  {/* Description */}
                  <div className="flex order-2 flex-2 flex-col gap-4 items-start leading-none relative shrink-0 weight text-black w-96">
                    <h2 className="bee-title font-bold bee-title-h4-desktop not-italic w-fit">
                      What's in the Hive?
                    </h2>
                    <p className="text-center lg:text-start bee-body-h6-desktop w-fit">
                      From the sweetest snacks to the handiest supplies, the hive
                      has something for every moment in your day.
                    </p>
                  </div>
                </div>
              </div>
              <img src={honey} alt="" className="z-10 flex w-full" />
            </div>
          </div>

          <div className="w-full z-20 relative">
            {/* CTA Section */}
            <div className="top-[230px] left-[170px] absolute flex flex-col gap-8 items-start z-20 px-8 py-16">
              <div className="flex flex-col gap-4 text-gray-800">
                <h2 className="bee-title-h2-desktop bee-title text-3xl font-bold">
                  Want to be Part of the Colony?
                </h2>
                <p className="bee-body-h6-desktop">
                  Sign up today—faster than you can say bzzt!
                </p>
              </div>
              <button onClick={()=>{navigate("/SellerPage")}} className="btn-primary btn-anim rounded-2xl box-border flex items-center justify-center px-16 py-4 relative border-2 shadow-md hover:bg-amber-100 whitespace-nowrap font-semibold">
                Sell Now
              </button>
            </div>

            {/* Main BG Image */}
            <div className="relative w-full aspect-auto">
              <img
                alt="Beez Background"
                className="relative block max-w-none w-full h-full z-10 object-cover"
                src={bg_honeycomb}
              />
              <img className="absolute left-10 bottom-150 z-0 " src={bee} alt="" />
              <img className="absolute w-70 aspect-auto left-200 bottom-170 z-0 -scale-x-100" src={bee} alt="" />
              <img className="absolute w-70 aspect-auto left-190 bottom-410 z-0 rotate-10 -scale-x-100" src={bee} alt="" />
              <img className="absolute w-40 aspect-auto left-93 rotate-10 bottom-296 z-0 -scale-x-100" src={bee} alt="" />
              <img className="absolute w-70 aspect-auto right-7 bottom-140 z-0" src={bee} alt="" />
              <img className="absolute w-40 aspect-auto right-10 top-20 z-0 -scale-x-100" src={bee} alt="" />
              <img className="absolute w-30 aspect-auto right-40 top-88 z-0" src={bee} alt="" />
              <img className="-scale-x-100 absolute w-60 aspect-auto right-20 top-180 z-0" src={bee} alt="" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
