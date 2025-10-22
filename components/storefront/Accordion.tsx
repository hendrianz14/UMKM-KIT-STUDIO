'use client';

import { useState, type ReactNode } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';

interface AccordionProps {
  title: string;
  children: ReactNode;
}

const Accordion = ({ title, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <h2>
        <button
          type="button"
          className="flex w-full items-center justify-between p-5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          <span>{title}</span>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </h2>
      {isOpen && <div className="p-5 text-sm text-gray-700">{children}</div>}
    </div>
  );
};

export default Accordion;
