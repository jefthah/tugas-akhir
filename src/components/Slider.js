"use client";

import { useState, useEffect } from "react";

const slides = [
  {
    image: "/images/slider/Slider_1.jpg",
    text: "With LeADS, Learn as if you were to live forever",
  },
  {
    image: "/images/slider/Slider_2.jpg",
    text: "LeADS: Learn Remotely From Anywhere",
  },
  {
    image: "/images/slider/Slider_3.jpg",
    text: "LeADS: Access Your Course Today",
  },
  {
    image: "/images/slider/Slider_2.jpg",
    text: "LeADS: Learn From Anywhere, On Any Device",
  },
];

export default function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Ganti slide setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex transition-all duration-700"
      style={{
        backgroundImage: `url(${slides[currentSlide].image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay Gelap */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Konten Slider */}
      <div className="relative text-white flex flex-col justify-center items-center sm:items-start sm:ml-16 md:ml-52 p-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center sm:text-left mb-4">{slides[currentSlide].text}</h1>
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-gray-400"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
