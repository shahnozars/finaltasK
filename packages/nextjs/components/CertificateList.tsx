// components/CertificateList.tsx
import React from 'react';

interface CertificateListProps {
  issuedCertificates: string[];
}

const CertificateList: React.FC<CertificateListProps> = ({ issuedCertificates }) => {
  return (
    <div>
      <h2>Список выданных сертификатов</h2>
      {issuedCertificates.length === 0 ? (
        <p>Нет выданных сертификатов.</p>
      ) : (
        <ul>
          {issuedCertificates.map((certificate, index) => (
            <li key={index}>{certificate}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CertificateList;
