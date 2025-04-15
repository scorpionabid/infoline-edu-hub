
import React from 'react';

/**
 * Mətndə axtarış termini vurğulayan funksiya
 * @param text Orijinal mətn
 * @param searchTerm Axtarış termini
 * @returns Vurğulanmış mətn komponenti
 */
export const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm.trim() || !text) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-yellow-100 text-yellow-900 px-1 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};
