
import React from 'react';

interface HighlightTextProps {
  text: string;
  terms: string[];
  className?: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, terms, className = "" }) => {
  if (!text) return null;
  
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const validTerms = terms.filter(Boolean);
  
  if (validTerms.length === 0) return <span className={className}>{text}</span>;

  let parts: (string | React.ReactNode)[] = [text];
  
  validTerms.forEach(term => {
    const escapedTerm = escapeRegExp(term);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    const newAllParts: (string | React.ReactNode)[] = [];
    
    parts.forEach((part, i) => {
      if (typeof part === 'string') {
        const subParts = part.split(regex);
        subParts.forEach((subPart, idx) => {
          if (subPart.toLowerCase() === term.toLowerCase()) {
            newAllParts.push(
              <mark key={`${term}-${i}-${idx}`} className="bg-yellow-200 text-slate-900 px-0.5 rounded font-bold underline decoration-yellow-500">
                {subPart}
              </mark>
            );
          } else if (subPart) {
            newAllParts.push(subPart);
          }
        });
      } else {
        newAllParts.push(part);
      }
    });
    parts = newAllParts;
  });

  return <span className={className}>{parts}</span>;
};

export default HighlightText;
