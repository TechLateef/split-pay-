export const MONAD_TESTNET = {
  id: 31337,
  name: 'Local Hardhat',
  network: 'localhost',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
    public: {
      http: ['http://localhost:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadExplorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
  faucetUrl: 'https://testnet.monad.xyz',
  speedSeconds: 0.6,
  estimatedGasFeeMON: '0.0008',
};
