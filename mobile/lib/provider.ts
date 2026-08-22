import { ethers } from 'ethers';
import { MONAD_TESTNET } from './monadChain';
import SplitFactoryContract from '../contracts/SplitFactory.json';
import SplitBillContract from '../contracts/SplitBill.json';

const MONAD_RPC = process.env.EXPO_PUBLIC_MONAD_RPC || MONAD_TESTNET.rpcUrls.default.http[0];

export const getProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(MONAD_RPC, {
    chainId: MONAD_TESTNET.id,
    name: MONAD_TESTNET.network,
  });
};

export const getSignerFromPrivateKey = (privateKey: string): ethers.Wallet => {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};

export const getSplitFactoryContract = (
  customAddress?: string,
  signerOrProvider?: ethers.ContractRunner
): ethers.Contract => {
  const address =
    customAddress ||
    process.env.EXPO_PUBLIC_FACTORY_ADDRESS ||
    (SplitFactoryContract as any).address ||
    '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  
  const runner = signerOrProvider || getProvider();
  return new ethers.Contract(address, (SplitFactoryContract as any).abi, runner);
};

export const getSplitBillContract = (
  billAddress: string,
  signerOrProvider?: ethers.ContractRunner
): ethers.Contract => {
  const runner = signerOrProvider || getProvider();
  return new ethers.Contract(billAddress, (SplitBillContract as any).abi, runner);
};
