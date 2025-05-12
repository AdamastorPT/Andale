import React from 'react';
import { Link } from 'wouter';
import logoImage from '@/assets/images/logo.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
}

const Logo = ({ size = 'medium', variant = 'dark' }: LogoProps) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  };

  return (
    <Link href="/">
      <div className="flex items-center cursor-pointer">
        <img 
          src={logoImage} 
          alt="DR Bijuteria - Peças em aço inoxidável" 
          className={`${sizeClasses[size]} object-contain`} 
        />
      </div>
    </Link>
  );
};

export default Logo;