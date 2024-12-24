"use client";

import { FC, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

// Адрес контракта
const certificateManagerAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ABI контракта
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

interface CertificateFormProps {
  issueCertificate: (certificateId: string) => void;
  checkCertificate: (certificateId: string) => void;
  revokeCertificate: (certificateId: string) => void;
  isDarkMode: boolean;
}

const CertificateForm: FC<CertificateFormProps> = ({
  issueCertificate,
  checkCertificate,
  revokeCertificate,
  isDarkMode
}) => {
  const [certificateId, setCertificateId] = useState("");
  const { address } = useAccount(); // Получаем адрес подключенного кошелька
  const { data: publicClient } = usePublicClient(); // Для чтения данных контракта
  const { data: walletClient } = useWalletClient(); // Для подписания транзакций

  const handleSubmit = async (action: string) => {
    if (!certificateId || !walletClient || !publicClient) return;

    try {
      const contract = publicClient.contract({
        address: certificateManagerAddress,
        abi: CertificateManagerABI,
      });

      let tx;

      if (action === "issue") {
        tx = await walletClient.write({
          to: certificateManagerAddress,
          data: contract.interface.encodeFunctionData("issueCertificate", [
            certificateId,
          ]),
        });
      } else if (action === "check") {
        const isValid = await contract.read("checkCertificate", [
          certificateId,
        ]);
        alert(isValid ? "Сертификат действителен" : "Сертификат недействителен");
        return;
      } else if (action === "revoke") {
        tx = await walletClient.write({
          to: certificateManagerAddress,
          data: contract.interface.encodeFunctionData("revokeCertificate", [
            certificateId,
          ]),
        });
      }

      // Ожидаем завершения транзакции
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
      if (action === "issue") {
        issueCertificate(certificateId);
      } else if (action === "revoke") {
        revokeCertificate(certificateId);
      }
    } catch (error) {
      console.error("Transaction failed", error);
    }
  };

  return (
    <div
      className={`p-6 space-y-4 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
    >
      <h2 className="text-2xl font-semibold">Управление сертификатами</h2>
      <input
        type="text"
        placeholder="Введите ID сертификата"
        value={certificateId}
        onChange={(e) => setCertificateId(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-300"
      />
      <div className="flex space-x-4">
        <button
          onClick={() => handleSubmit("issue")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Выдать сертификат
        </button>
        <button
          onClick={() => handleSubmit("check")}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Проверить сертификат
        </button>
        <button
          onClick={() => handleSubmit("revoke")}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Отозвать сертификат
        </button>
      </div>
    </div>
  );
};


const lightTheme = {
  formContainer: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
  },
  header: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

const darkTheme = {
  formContainer: {
    backgroundColor: '#444',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    marginBottom: '30px',
  },
  header: {
    fontSize: '1.5rem',
    color: '#fff',
    marginBottom: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #666',
    backgroundColor: '#333',
    color: '#fff',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#1e90ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

export default CertificateForm;
