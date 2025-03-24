import React from 'react';
import { Link } from 'react-router-dom';
import mtmIcon from '../media/mtm-icon.svg';

export default function Footer() {

  return (
    <footer className="bg-white text-center pt-10 border-t-4 border-fuchsia-700">
      <div className="container mx-auto px-10 flex flex-col items-center justify-center">
        <div className="text-neutral-700 flex flex-col items-center">
          <nav className="mt-2">
          <Link
            to="/instruktion"
            className="text-md font-semibold text-blue-600 hover:text-blue-700 underline mx-2 cursor-pointer"
          >
            Användarinstruktioner
          </Link>
            |
            <a
              className="text-md font-semibold text-blue-600 hover:text-blue-700 underline mx-2"
              href="https://www.mtm.se/" target='_blank' rel="noreferrer"
            >
              Myndigheten för Tillgängliga Medier
            </a>
            |
            <a
              className="text-md font-semibold text-blue-600 hover:text-blue-700 underline mx-2"
              href="https://www.legimus.se/" target='_blank' rel="noreferrer"
            >
              Legimus
            </a>
            |      
            <Link
              to="/om-kakor-och-tillganglighet"
              className="text-md font-semibold text-blue-600 hover:text-blue-700 underline mx-2 cursor-pointer"
            >
              Kakor och tillgänglighet
            </Link>
            |
            <Link
              to="/kontakt"
              className="text-md font-semibold text-blue-600 underline hover:text-blue-700 mx-2 cursor-pointer"
            >
              Kontakta oss
            </Link>
          </nav>

          <div className='mt-10 mb-5 w-56'>
            <img src={mtmIcon} alt='mtm ikon' className='h-full w-full' />
          </div>
        </div>
      </div>
    </footer>
  );
}
