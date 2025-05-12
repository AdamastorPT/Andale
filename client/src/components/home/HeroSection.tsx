import React from 'react';
import { Link } from 'wouter';
import storeImage from '@/assets/images/store.jpg';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-no-repeat bg-cover h-[600px] mb-12">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${storeImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-900 bg-opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-xl text-white">
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            Jóias Elegantes em <br />
            <span className="font-semibold">Aço Inoxidável</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Descubra nossa nova coleção de jóias em aço inoxidável, perfeitas para qualquer ocasião.
            Peças elegantes, duráveis e hipoalergênicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-white text-black hover:bg-neutral-200">
              <Link href="/category/earrings">
                Ver Coleção
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link href="/about">
                Nossa História
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;