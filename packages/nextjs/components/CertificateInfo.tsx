// components/CertificateInfo.tsx
import React from 'react';

interface CertificateInfoProps {
  certificateInfo: string;
  errorMessage: string;
}

const CertificateInfo: React.FC<CertificateInfoProps> = ({ certificateInfo, errorMessage }) => {
  return (
    <div>
      {certificateInfo && <p>{certificateInfo}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default CertificateInfo;
