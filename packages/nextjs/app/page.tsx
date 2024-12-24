"use client";

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import CertificateForm from '../components/CertificateForm';
import CertificateInfo from '../components/CertificateInfo';
import CertificateList from '../components/CertificateList';

// Адрес контракта
const certificateManagerAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// ABI контракта, встроенный прямо в код
const CertificateManagerABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      }
    ],
    "name": "checkCertificate",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      }
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CertificatePage = () => {
  const { address } = useAccount(); // Получаем адрес подключенного кошелька
  const [certificateInfo, setCertificateInfo] = useState<string | null>(null); // Состояние для информации о сертификате
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибок
  const [issuedCertificates, setIssuedCertificates] = useState<string[]>([]); // Состояние для списка выданных сертификатов
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Состояние для отслеживания текущей темы (темная или светлая)

  const { data: publicClient } = usePublicClient(); // Для чтения данных контракта
  const { data: walletClient } = useWalletClient(); // Для подписания транзакций

  useEffect(() => {
    // Проверка темы, например, из localStorage или предпочтений пользователя
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    if (publicClient && walletClient) {
      // Инициализация контракта с использованием publicClient
      const contract = publicClient.contract({
        address: certificateManagerAddress,
        abi: CertificateManagerABI,
      });

      // Функции для взаимодействия с контрактом
      const issueCertificate = async (certificateId: string) => {
        try {
          const tx = await contract.write('issueCertificate', [certificateId]);
          await tx.wait(); // Ожидаем завершения транзакции
          setIssuedCertificates((prev) => [...prev, certificateId]); // Добавляем сертификат в список
          setCertificateInfo(`Сертификат с ID ${certificateId} выдан успешно.`);
        } catch (error) {
          setErrorMessage(`Ошибка при выдаче сертификата: ${error.message}`);
        }
      };

      const checkCertificate = async (certificateId: string) => {
        try {
          const isValid = await contract.read('checkCertificate', [certificateId]);
          if (isValid) {
            setCertificateInfo(`Сертификат с ID ${certificateId} действителен.`);
          } else {
            setCertificateInfo(`Сертификат с ID ${certificateId} недействителен.`);
          }
        } catch (error) {
          setErrorMessage(`Ошибка при проверке сертификата: ${error.message}`);
        }
      };

      const revokeCertificate = async (certificateId: string) => {
        try {
          const tx = await contract.write('revokeCertificate', [certificateId]);
          await tx.wait(); // Ожидаем завершения транзакции
          setIssuedCertificates((prev) => prev.filter((id) => id !== certificateId)); // Удаляем сертификат из списка
          setCertificateInfo(`Сертификат с ID ${certificateId} отозван.`);
        } catch (error) {
          setErrorMessage(`Ошибка при отзыве сертификата: ${error.message}`);
        }
      };

      // Возвращаем компоненты с необходимыми пропсами
      return (
        <div style={isDarkMode ? darkTheme.container : lightTheme.container}>
          <h1 style={isDarkMode ? darkTheme.header : lightTheme.header}>Управление сертификатами</h1>
          <div style={isDarkMode ? darkTheme.formContainer : lightTheme.formContainer}>
            <CertificateForm
              issueCertificate={issueCertificate}
              checkCertificate={checkCertificate}
              revokeCertificate={revokeCertificate}
            />
          </div>
          {errorMessage && <div style={isDarkMode ? darkTheme.errorMessage : lightTheme.errorMessage}>{errorMessage}</div>}
          <div style={isDarkMode ? darkTheme.certificateInfo : lightTheme.certificateInfo}>
            <CertificateInfo certificateInfo={certificateInfo} errorMessage={errorMessage} />
          </div>
          <div style={isDarkMode ? darkTheme.certificateList : lightTheme.certificateList}>
            <CertificateList issuedCertificates={issuedCertificates} />
          </div>
        </div>
      );
    }
  }, [publicClient, walletClient, isDarkMode]);

  return (
    <div style={isDarkMode ? darkTheme.container : lightTheme.container}>
      <h1 style={isDarkMode ? darkTheme.header : lightTheme.header}>Управление сертификатами</h1>
      <div style={isDarkMode ? darkTheme.formContainer : lightTheme.formContainer}>
        <CertificateForm
          issueCertificate={() => {}}
          checkCertificate={() => {}}
          revokeCertificate={() => {}}
        />
      </div>
      <div style={isDarkMode ? darkTheme.certificateInfo : lightTheme.certificateInfo}>
        <CertificateInfo certificateInfo={certificateInfo} errorMessage={errorMessage} />
      </div>
      <div style={isDarkMode ? darkTheme.certificateList : lightTheme.certificateList}>
        <CertificateList issuedCertificates={issuedCertificates} />
      </div>
    </div>
  );
};

// Светлая тема
const lightTheme = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    fontFamily: '"Arial", sans-serif',
    color: '#333',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    fontSize: '2.5rem',
    marginBottom: '40px',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
  },
  certificateInfo: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
    textAlign: 'center',
  },
  certificateList: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  errorMessage: {
    color: '#e74c3c',
    fontSize: '1.1rem',
    textAlign: 'center',
    marginBottom: '20px',
  },
};

// Темная тема
const darkTheme = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#333',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    fontFamily: '"Arial", sans-serif',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    color: '#fff',
    fontSize: '2.5rem',
    marginBottom: '40px',
  },
  formContainer: {
    backgroundColor: '#444',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    marginBottom: '30px',
  },
  certificateInfo: {
    backgroundColor: '#444',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    marginBottom: '30px',
    textAlign: 'center',
  },
  certificateList: {
    backgroundColor: '#444',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  errorMessage: {
    color: '#e74c3c',
    fontSize: '1.1rem',
    textAlign: 'center',
    marginBottom: '20px',
  },
};

export default CertificatePage;
