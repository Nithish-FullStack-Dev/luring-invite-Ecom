import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Link } from "react-router-dom";

const BannerTransition = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "CHOOSE YOUR",
      subtitle: "INVITATION",
      description: "VIDEO",
      activeStep: 0,
      images: [
        { id: "1", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405382/03_ljijd4.png" },
        { id: "2", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405382/01_3_mudjwq.png" },
        { id: "3", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405383/02_2_k9crmm.png" },
      ]
    },
    {
      title: "FILL YOUR",
      subtitle: "EVENT",
      description: "DETAILS",
      activeStep: 1,
      images: [
        { id: "2", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405382/01_3_mudjwq.png" },
        { id: "3", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405383/02_2_k9crmm.png" },
        { id: "1", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405382/03_ljijd4.png" },
      ]
    },
    {
      title: "PAY AND",
      subtitle: "DOWNLOAD",
      description: "VIDEO INSTANTLY",
      activeStep: 2,
      images: [
        { id: "3", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405383/02_2_k9crmm.png" },
        { id: "1", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405382/03_ljijd4.png" },
        { id: "2", src: "https://res.cloudinary.com/drdotym31/image/upload/v1750405382/01_3_mudjwq.png" },
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = slides[currentSlide];

  return (
    <section className="relative min-h-[60vh] bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 overflow-hidden">
      {/* Floating Decorative Elements */}
      {/* <img src="https://www.svgrepo.com/show/34162/butterfly.svg"
        className="absolute w-16 h-16 left-10 top-10 animate-bounce z-0 opacity-30"
        alt="Butterfly" />

      <img src="https://www.svgrepo.com/show/312375/flower.svg"
        className="absolute w-14 h-14 right-10 bottom-10 animate-spin-slow z-0 opacity-20"
        alt="Flower" /> */}
        {/* Floating Decorative Emojis */}
  <div className="absolute top-10 left-10 text-5xl opacity-15 animate-butterfly">🦋</div>
  <div className="absolute top-40 right-10 text-4xl opacity-20 animate-float">🌷</div>
  <div className="absolute bottom-20 left-20 text-4xl opacity-15 animate-float">🌻</div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Text Content */}
            <motion.div
              key={`text-${currentSlide}`}
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1.2 }}
            >
              <div className="capitalize leading-snug space-y-2">
                <h1 className="text-3xl lg:text-3xl font-outfit font-semibold text-gray-800">
                  {current.title.toLowerCase()}
                </h1>
                <h2 className="text-4xl lg:text-6xl font-berkshire text-gradient">
                  {current.subtitle.toLowerCase()}
                </h2>
                <h3 className="text-3xl lg:text-3xl font-outfit font-semibold text-gray-800">
                  {current.description.toLowerCase()}
                </h3>
              </div>

              <div className="flex items-center space-x-4">
                {["Choose", "Customize", "Download"].map((step, index) => (
                  <React.Fragment key={index}>
                    {index !== 0 && <span className="text-xl text-gray-500">•</span>}
                    <span className={`text-lg font-medium ${index === current.activeStep ? 'text-black' : 'text-gray-500'}`}>
                      {step}
                    </span>
                  </React.Fragment>
                ))}
              </div><br></br>
              <Link to="/collections">
  <button className="bg-[#A86DCD] hover:bg-[#934bbf] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
    <span>Explore Now</span>
    <span>→</span>
  </button>
</Link>
            </motion.div>

            {/* Images */}
            <LayoutGroup>
              <div className="hidden lg:grid grid-cols-2 gap-4 items-center justify-center">
                <div className="flex flex-col gap-4">
                  <motion.img
                    key={current.images[0].id}
                    layoutId={current.images[0].id}
                    src={current.images[0].src}
                    className="w-[170px] h-[278px] object-cover"
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                  <motion.img
                    key={current.images[1].id}
                    layoutId={current.images[1].id}
                    src={current.images[1].src}
                    className="w-[170px] h-[278px] object-cover"
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </div>
                <motion.img
                  key={current.images[2].id}
                  layoutId={current.images[2].id}
                  src={current.images[2].src}
                  className="w-[300px] h-[491px] object-cover"
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
              </div>

              {/* Mobile Only Big Image */}
              <div className="lg:hidden flex justify-center">
                <motion.img
                  key={`mobile-${current.images[2].id}`}
                  src={current.images[2].src}
                  className="w-[170px] h-[278px] object-cover"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </LayoutGroup>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center space-x-3 mt-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerTransition;
