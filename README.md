# 💸 SplitPay — On-Chain Split Payment Mobile App on Monad Testnet

> **Split Bills. Not Trust.**
> 
> Fully non-custodial group payments powered by Monad's 0.6-second block finality and near-zero gas fees. Built with React Native, Expo Router, TypeScript, ethers.js v6, and Solidity smart contracts.

---

## ⚡ Why Monad?

On Ethereum mainnet, splitting a $20 meal or drinks bill would cost $5–$20 in gas fees and take minutes to confirm — making real-world micro-splits impossible. 

On **Monad**:
- 🚀 **0.6s Block Time & Finality**: Feels instant like Apple Pay or Cash App
- ⛽ **Fractions of a Penny Gas**: Micro-splits (< $50) are genuinely viable on-chain
- 🔒 **Trustless Factory Pattern**: Isolated smart contract per bill with automated refund security

---

## 🏗️ Architecture & Project Structure

```
/shareIt
├── contracts/                        # Smart Contracts (Solidity ^0.8.20)
│   ├── SplitFactory.sol              # Factory contract deploying isolated bills
│   └── SplitBill.sol                 # Individual escrow & state contract
├── test/
│   └── SplitPayment.test.ts          # Comprehensive unit test suite (9 tests)
├── scripts/
│   └── deploy.ts                     # Auto-exports ABI & deployed address to mobile
├── hardhat.config.ts                 # Hardhat configuration (Monad Testnet 10143)
│
└── mobile/                           # React Native / Expo Mobile App
    ├── app/                          # File-based routing (Expo Router)
    │   ├── _layout.tsx               # Root Layout with Providers & Toasts
    │   ├── onboarding.tsx            # Welcome & value propositions
    │   ├── how-it-works.tsx          # Protocol guide & lifecycle
    │   ├── (tabs)/
    │   │   ├── _layout.tsx           # Custom 4-tab bottom navigation
    │   │   ├── index.tsx             # Dashboard (Created & Invited splits, Stats)
    │   │   ├── create.tsx            # 3-step wizard with live split calculator
    │   │   ├── activity.tsx          # Global timeline with event filters
    │   │   └── profile.tsx           # Wallet info, Monad status, faucet link
    │   └── bill/
    │       └── [address].tsx         # Deep link target (splitpay://bill/0x...)
    ├── components/
    │   ├── ui/                       # AppButton, AppCard, AppBadge, BlockieAvatar...
    │   ├── bill/                     # BillCard, BillProgress, ActionCard, TransactionFeed...
    │   ├── create/                   # StepProgress, StepOne, StepTwo, StepThree...
    │   └── shared/                   # StatsRow, WalletModal, WrongNetworkSheet...
    ├── hooks/                        # useWallet, useSplitFactory, useSplitBill...
    ├── lib/                          # provider, monadChain, format, storage
    ├── store/                        # Zustand stores (walletStore, billsStore, uiStore)
    └── theme/                        # Monad purple Web3 dark theme tokens
```

---

## 🚀 Quick Start Guide

### 1. Smart Contract Suite

Run tests and compile contracts:
```bash
# In the root directory:
npm test
```

Deploy to Monad Testnet:
```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

### 2. Mobile App (Expo)

```bash
cd mobile
npm install

# Start the interactive development server
npx expo start
```

Press `w` to open in Web Browser, `a` for Android Emulator, or scan the QR code using the **Expo Go** app on iOS / Android.

---

## 📱 3-Minute Demo Flow (For Hackathon Judges)

1. **Launch App**: Opens directly to Dashboard with pre-configured Monad Testnet demo personas.
2. **Create Split**:
   - Tap **"New Split"** tab.
   - Enter title: *"Dinner at Yellow Chilli 🌶️"*.
   - Enter amount: `10 MON` and add friend addresses.
   - Live breakdown calculates `2.5 MON` each.
   - Tap **"Create & Pay My Share"** — confirms in **0.6 seconds** on Monad.
3. **Share Deep Link**:
   - Tap **"Share with Friends"** to copy/share `splitpay://bill/0x...`.
4. **Switch Persona to Friend**:
   - Tap the top persona switcher banner and select **Alice** or **Bob**.
5. **1-Tap Settle**:
   - Tap **"Pay Now on Monad"** — payment confirms in **0.6 seconds**.
   - Dashboard circular progress ring updates in real-time.
6. **Withdraw**:
   - Switch back to **Organizer** — tap **"Withdraw Funds"** to payout collected funds.
7. **Verify on Monad Explorer**:
   - Tap **"View 0.6s tx on Explorer"** on any transaction feed item.

---

## 🔐 Security & Contract Safety

- **ReentrancyGuard**: Applied on all native transfer routines (`pay`, `claimRefund`, `withdrawSettled`).
- **Creator Upfront Payment**: Creator must pay their exact share upfront in the deployment transaction (`msg.value == splitAmount`).
- **Pull-Over-Push Refunds**: Avoids Denial-of-Service if a recipient address reverts.
- **Deadline Guard**: Automatic expiration unlocks full refunds if a split is not settled in time.

---

## 🌐 Monad Testnet Details

- **Network Name**: Monad Testnet
- **Chain ID**: `10143`
- **Native Currency**: `MON`
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Explorer**: `https://testnet.monadexplorer.com`
- **Faucet**: `https://testnet.monad.xyz`
