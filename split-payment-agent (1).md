# 💸 AI Agent Prompt: On-Chain Split Payment Mobile App on Monad

---

## CONTEXT & OBJECTIVE

Build a fully functional **On-Chain Split Payment mobile app** deployed on the **Monad testnet**. The app allows one person to create a bill, invite friends via a deep link, and have each friend's share automatically collected via a smart contract — all confirmed in under a second thanks to Monad's 0.6s finality and near-zero gas fees.

This is a hackathon project. Prioritise working functionality, clean mobile UI, and a compelling demo flow. The app must be fully runnable on both iOS and Android and demonstrable end to end.

---

## WHY MONAD

On Ethereum mainnet, splitting a $20 dinner bill would cost $5–20 per transaction in gas fees — making it completely impractical. On Monad:

- Gas fees are fractions of a penny
- Transactions confirm in 0.6 seconds
- The UX feels like a regular mobile app, not a blockchain app
- Small real-world splits (under $50) are genuinely viable on-chain

This is a use case that only makes sense on a high-performance EVM chain like Monad.

---

## TECH STACK

**Smart Contract:**
- Language: Solidity ^0.8.20
- Framework: Hardhat
- Network: Monad Testnet
  - Chain ID: 10143
  - RPC URL: https://testnet-rpc.monad.xyz
  - Explorer: https://testnet.monadexplorer.com

**Mobile App:**
- Framework: React Native (Expo — managed workflow)
- Language: TypeScript
- Navigation: Expo Router (file-based routing)
- Styling: NativeWind (Tailwind CSS for React Native)
- Web3: ethers.js v6 + viem
- Wallet: WalletConnect v2 + @reown/appkit-react-native
- State Management: Zustand + TanStack Query (React Query)
- Storage: expo-secure-store (for private keys / session tokens)
- Deep Linking: Expo Linking + Expo Router
- Notifications: expo-notifications
- Clipboard: expo-clipboard
- Share: expo-sharing + Share API
- Animations: react-native-reanimated
- Charts: victory-native

---

## SMART CONTRACT SPECIFICATION

### Contract Name: `SplitPayment.sol`

Build a **factory pattern** — one `SplitFactory` contract that deploys individual `SplitBill` contracts per bill. Each bill is isolated with its own state, participants, and funds.

---

### `SplitFactory.sol`

```
Responsibilities:
- Deploy a new SplitBill contract per gig
- Track all bills created by a given address
- Track all bills a given address is a participant of
- Allow querying bills by creator or participant

Events:
- BillCreated(
    address billAddress,
    address creator,
    string billTitle,
    uint256 totalAmount,
    uint256 splitAmount,
    uint256 participantCount
  )
```

---

### `SplitBill.sol`

#### State Variables

```
- creator: address
- billTitle: string
- billDescription: string
- totalAmount: uint256          // total bill amount in MON (wei)
- splitAmount: uint256          // amount each participant owes
- participants: address[]       // list of invited participant addresses
- paid: mapping(address => bool)
- createdAt: uint256
- deadline: uint256             // optional payment deadline
- status: enum (Open, Settled, Cancelled, Expired)
- paidCount: uint256
- totalCollected: uint256
```

#### Status Flow

```
Open → Settled   (all participants have paid)
Open → Cancelled (creator cancels before settlement)
Open → Expired   (deadline passed, not all paid)
```

#### Functions

```
constructor(
  string memory _billTitle,
  string memory _billDescription,
  address[] memory _participants,
  uint256 _splitAmount,
  uint256 _deadlineInHours       // 0 = no deadline
) payable
// Called by creator with msg.value == splitAmount (creator pays their share upfront)
// Records creator as paid. Sets status to Open.

pay() payable
// Called by a participant to pay their share
// msg.value must equal splitAmount exactly
// Participant must be in the participants list
// Participant must not have already paid
// If all participants have paid: status → Settled
// Emits ParticipantPaid and optionally BillSettled

cancelBill()
// Only callable by creator
// Status must be Open
// Refunds all participants who have already paid
// Refunds creator. Sets status to Cancelled.

claimRefund()
// Callable by any participant
// Only if status is Expired or Cancelled
// Refunds caller if they have paid. Prevents double-refund.

expireBill()
// Callable by anyone after deadline has passed
// Sets status to Expired. Allows refunds.

withdrawSettled()
// Only callable by creator
// Only if status is Settled
// Transfers total collected amount to creator

getDetails()
// Public view — returns all contract state in one call
// Includes participant list with paid status per address

getParticipantStatus(address participant)
// Returns whether a specific address has paid
```

#### Security Requirements

```
- ReentrancyGuard on all functions that transfer funds
- Validate msg.value == splitAmount exactly on pay()
- Validate participant is in list before accepting payment
- Validate no double payments via paid mapping
- Validate creator cannot cancel after Settled
- Validate all addresses non-zero in constructor
- Pull-over-push pattern for refunds
- All state changes emit events
```

#### Events

```
BillCreated(address creator, string title, uint256 totalAmount, uint256 participantCount)
ParticipantPaid(address participant, uint256 amount, uint256 paidCount, uint256 remaining)
BillSettled(address creator, uint256 totalCollected)
BillCancelled(address creator)
BillExpired(uint256 timestamp)
RefundClaimed(address participant, uint256 amount)
CreatorWithdrew(address creator, uint256 amount)
```

---

### Hardhat Config

```javascript
// hardhat.config.ts
networks: {
  monadTestnet: {
    url: "https://testnet-rpc.monad.xyz",
    chainId: 10143,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

Write a deploy script that:
1. Deploys SplitFactory
2. Logs the deployed address
3. Saves the ABI and address to `/mobile/contracts/` automatically

---

## MOBILE APP SPECIFICATION

### Expo Setup

```bash
npx create-expo-app split-pay --template blank-typescript
cd split-pay
npx expo install expo-router expo-linking expo-secure-store
npx expo install expo-clipboard expo-sharing expo-notifications
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @tanstack/react-query zustand
npm install ethers viem
npm install nativewind tailwindcss
npm install @reown/appkit-react-native @walletconnect/react-native-compat
npm install victory-native
```

Configure `app.json`:
```json
{
  "expo": {
    "scheme": "splitpay",
    "deepLinking": true,
    "plugins": ["expo-router"]
  }
}
```

---

### Screens & Navigation (Expo Router)

```
/app
├── (tabs)
│   ├── _layout.tsx              # Bottom tab navigator
│   ├── index.tsx                # Home / Dashboard
│   ├── create.tsx               # Create bill (multi-step wizard)
│   ├── activity.tsx             # All bills activity feed
│   └── profile.tsx              # Wallet & profile screen
├── bill
│   └── [address].tsx            # Bill detail screen (deep link target)
├── onboarding.tsx               # First launch + wallet connect
├── how-it-works.tsx
└── _layout.tsx                  # Root layout with providers
```

---

### Onboarding Screen (`/onboarding`)

Show on first launch only (check expo-secure-store for session):

```
Full screen dark background with Monad purple gradient at top

1. App logo + name "SplitPay"
2. Tagline: "Split Bills. Not Trust."
3. Three feature highlights (horizontal scroll cards):
   - "Instant" — 0.6s confirmation on Monad
   - "Cheap" — Fractions of a penny per split
   - "Trustless" — Smart contract holds funds

4. "Connect Wallet" button (large, purple, full width)
   → Opens WalletConnect modal (@reown/appkit-react-native)
   → Supports MetaMask Mobile, Rainbow, Trust Wallet

5. After wallet connects:
   → Auto-switch or prompt to switch to Monad testnet
   → If wrong network: show bottom sheet "Switch to Monad Testnet"
     with "Switch Now" button
   → On success: navigate to (tabs)/index
```

---

### Home / Dashboard Screen (`/(tabs)/index`)

Header:
```
Left:  App logo + "SplitPay"
Right: Wallet avatar + truncated address (0x1234...5678)
       Tap → navigate to profile screen
```

Stats row (3 cards, horizontal scroll):
```
Total Sent      Total Received    Active Bills
X.XX MON        X.XX MON          N
```
Fetch from SplitFactory using ethers.js + React Query.

Two tabs below stats:
```
[Bills I Created]    [Bills I'm In]
```

**Bills I Created tab:**
```
Vertical FlatList of BillCard components showing:
- Bill title
- Progress ring: X/Y paid (animated)
- Amount: X MON total
- Status badge
- Deadline (if set)
- Tap → navigate to /bill/[address]
```

**Bills I'm In tab:**
```
Vertical FlatList showing:
- Bill title
- Creator address (truncated)
- Your share: X MON
- Your status: Paid (green) / Pending (amber)
- "Pay Now" button if pending
- Tap → navigate to /bill/[address]
```

Empty state for each tab:
```
Bills I Created empty:
  Purple icon + "No bills yet"
  "Create your first split" button

Bills I'm In empty:
  Icon + "You haven't been added to any bills yet"
```

Pull-to-refresh on both lists.
Poll data every 5 seconds with React Query refetchInterval.

---

### Create Bill Screen (`/(tabs)/create`)

Full-screen multi-step wizard with animated step progress bar at top.
Use react-native-reanimated for step transitions (slide left/right).

**Step 1 — Bill Details**
```
Screen title: "New Bill Split"

Inputs:
- Bill Title        (TextInput, max 80 chars)
                    Character counter shown below
- Bill Description  (TextInput multiline, optional, max 300 chars)
- Set Deadline toggle (default OFF)
  If ON: show DateTimePicker
         Helper text: "Friends who miss this can claim a refund"

"Next" button (disabled until title is filled)
```

**Step 2 — Participants & Amount**
```
Screen title: "Who's Splitting?"

- Total Bill Amount (MON)
  Large numeric input with MON label
  Show estimated USD value below (fetch MON price from CoinGecko or hardcode for demo)

- Add Participants section:
  TextInput for wallet address
  "Add" button → validates EVM address → adds to list below
  Each added participant shown as a dismissible chip:
    0xabcd...efgh  [x]
  Min 1 participant. Max 20.
  Paste from clipboard button next to input.

- Auto-calculated summary card (updates live):
  ┌─────────────────────────────┐
  │  Total Amount:    10 MON   │
  │  People (incl. you):  4    │
  │  Each person pays: 2.5 MON │
  └─────────────────────────────┘

- "Split equally" toggle (ON by default)
  If toggled OFF: show individual amount input per participant

"Next" button (disabled until amount > 0 and at least 1 participant)
```

**Step 3 — Review & Confirm**
```
Screen title: "Review Split"

Summary card:
  Bill:          "Dinner at Yellow Chilli"
  Description:   "..."
  Total:         10 MON
  Participants:  3 friends + you
  Your share:    2.5 MON (paid now)
  Deadline:      Aug 10, 2026 or None

Participant list with truncated addresses

"Create & Pay My Share" button (large, full width, purple)

On press:
  1. Show bottom sheet: "Confirm in your wallet"
  2. Call SplitFactory.createBill() via ethers.js with msg.value = splitAmount
  3. Button state: idle → "Deploying on Monad..." (spinner) → success
  4. On success:
     - Navigate to success screen (modal overlay):
       * Animated checkmark (Lottie or reanimated)
       * "Bill Created!" heading
       * Bill contract address (truncated + copy button)
       * "Share with Friends" button (large, prominent)
         → opens native share sheet (expo-sharing)
         → share message:
           "Hey! Pay your share for [Bill Title].
            Amount: X MON
            Open in SplitPay: splitpay://bill/[address]
            No signup needed — just connect your wallet."
       * "View Bill" button → navigate to /bill/[address]
       * "Go to Dashboard" button
```

---

### Bill Detail Screen (`/bill/[address]`)

This screen is the deep link target — opened when a friend taps the shared link.
It must work for both participants (paying) and the creator (managing).

**Deep link format:**
```
splitpay://bill/0x1234...contractAddress
```

Configure in `app.json` and handle in `app/bill/[address].tsx`.

**Header:**
```
Back button
Bill title (truncated if long)
"Share" icon button (top right) → re-share the bill link
```

**Bill summary card:**
```
Bill Title (large)
Bill Description
Status badge (large): Open | Settled | Cancelled | Expired
Creator: 0x1234...5678 [Organiser]
Created: Aug 4, 2026 at 14:32
```

**Progress section:**
```
Animated circular progress ring (victory-native or reanimated):
  "2 of 4 paid"
  Percentage in centre

Participant list (FlatList):
  Row per participant:
    Avatar (generated from address — use blockies or jazzicon)
    0x1234...5678
    [You] label if it matches connected wallet
    Paid ✅ or Pending ⏳ badge
    Amount: 2.5 MON
```

**Action card (bottom of screen — sticky):**

Show based on connected wallet role and bill status:

```
IF connected wallet is a PARTICIPANT and status is Open and NOT paid:
  Card shows:
    "Your Share Due"
    2.5 MON  (large purple text)
    Estimated gas: ~0.001 MON
  "Pay Now" button (large, green, full width)
  On press:
    → Confirm bottom sheet
    → Call escrow.pay() with msg.value = splitAmount
    → Loading state: "Confirming on Monad..."
    → Success: animated checkmark + "Payment Confirmed!"

IF connected wallet is a PARTICIPANT and HAS paid:
  Green success card:
    Checkmark icon
    "You've paid your share"
    Transaction hash with "View on Explorer" link

IF connected wallet is the CREATOR and status is Open:
  "Cancel Bill" button (outline, red)
  Amount collected so far: X of Y MON

IF connected wallet is the CREATOR and status is Settled:
  Green card: "All friends have paid!"
  Total collected: 10 MON
  "Withdraw Funds" button (large, purple, full width)
  On press:
    → Call escrow.withdrawSettled()
    → Loading state: "Withdrawing..."
    → Success: "X MON sent to your wallet"

IF wallet NOT connected:
  Prompt card:
    "Connect your wallet to pay"
    "Connect Wallet" button → opens WalletConnect modal
```

**Countdown timer (if deadline set):**
```
"Time remaining: 2d 4h 12m"
Turns amber at 24 hours
Turns red at 1 hour
Shows "Expired" when past deadline
```

**Transaction history feed (FlatList):**
```
Timeline with vertical line connector:
  Purple dot — Bill created — Aug 4, 14:32
  Green dot  — 0xabcd... paid 2.5 MON — Aug 4, 15:01
  Green dot  — 0x9999... paid 2.5 MON — Aug 4, 16:45
  Gold dot   — Bill settled! — Aug 4, 16:45

Each item: tap → open Monad explorer URL in expo-web-browser
```

Poll contract state every 3 seconds with React Query refetchInterval for live updates.

---

### Activity Screen (`/(tabs)/activity`)

```
Full FlatList of all recent events across ALL bills the user is involved in:

Each event row:
  Icon (paid / created / settled / cancelled)
  Description: "You paid 2.5 MON for Dinner at Yellow Chilli"
  Timestamp: "2 hours ago"
  Tap → navigate to /bill/[address]

Filter chips at top:
  All | Created | Paid | Settled | Pending
```

---

### Profile Screen (`/(tabs)/profile`)

```
Wallet section:
  Generated avatar (blockies from address)
  Full wallet address
  Copy address button
  MON Balance (fetched live)
  "Disconnect Wallet" button

Network section:
  Current network: Monad Testnet
  Chain ID: 10143
  Status indicator: Connected (green dot)

App section:
  How It Works
  View on Monad Explorer (opens browser)
  Version: 1.0.0

Stats:
  Bills Created: N
  Bills Paid: N
  Total Sent: X MON
  Total Received: X MON
```

---

## WEB3 INTEGRATION

### ethers.js Setup

```typescript
// lib/provider.ts
import { ethers } from 'ethers';

const MONAD_RPC = 'https://testnet-rpc.monad.xyz';

export const getProvider = () => new ethers.JsonRpcProvider(MONAD_RPC);

export const getSigner = (privateKey: string) => {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};

export const getContract = (address: string, abi: any, signer?: ethers.Signer) => {
  return new ethers.Contract(address, abi, signer || getProvider());
};
```

### WalletConnect Integration

```typescript
// lib/walletConnect.ts
import { createAppKit } from '@reown/appkit-react-native';

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
};

createAppKit({
  projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [monadTestnet],
  defaultChain: monadTestnet,
  metadata: {
    name: 'SplitPay',
    description: 'Split bills on-chain on Monad',
    url: 'https://yourdomain.com',
    icons: ['https://yourdomain.com/icon.png'],
  },
});
```

---

## UI DESIGN SYSTEM

Dark, premium Web3 mobile aesthetic:

```
Background:        #0A0A0F
Card background:   #111118
Border:            #1E1E2E
Primary (purple):  #836EF9
Primary pressed:   #6B54F7
Accent (green):    #00D4AA   — paid / success
Warning (amber):   #F59E0B   — pending
Error (red):       #EF4444   — expired / cancelled
Text primary:      #F8F8FF
Text muted:        #8B8BA7
```

Typography (NativeWind + custom fonts via expo-font):
- Body: `Inter`
- Headings / numbers: `Space Grotesk`

Component rules:
- All cards: `bg-[#111118] border border-[#1E1E2E] rounded-2xl p-4`
- Primary buttons: purple background, subtle glow shadow
- All wallet addresses: truncated 0x1234...5678 with copy-to-clipboard
- All MON amounts: bold, purple text, MON label beside
- Loading buttons: three states — idle → spinner + "Confirming..." → success checkmark
- Progress ring: animated with react-native-reanimated
- Skeleton loaders (not spinners) for all data-fetching states
- Bottom sheet modals for all confirmations (react-native-bottom-sheet)
- Status badges: rounded pill, colour-coded per status

Mobile-specific UX rules:
- All primary actions in thumb-reach zone (bottom 40% of screen)
- Sticky action card at bottom of Bill Detail screen
- Haptic feedback on every successful on-chain action (expo-haptics)
- Pull-to-refresh on all list screens
- Swipe-to-go-back enabled on all detail screens

---

## DEEP LINKING

Configure universal links so shared bill links open the app directly:

```typescript
// app/bill/[address].tsx
import { useLocalSearchParams } from 'expo-router';

export default function BillDetailScreen() {
  const { address } = useLocalSearchParams<{ address: string }>();
  // fetch bill data using the contract address
}
```

Share link format:
```
splitpay://bill/0xContractAddress
```

If app is not installed, fall back to a web page (optional for hackathon).

---

## PROJECT FOLDER STRUCTURE

```
/split-pay-monad
├── /contracts                          # Hardhat project
│   ├── SplitFactory.sol
│   ├── SplitBill.sol
│   └── /test
│       ├── SplitFactory.test.ts
│       └── SplitBill.test.ts
├── /scripts
│   └── deploy.ts
├── hardhat.config.ts
├── .env
│
└── /mobile                             # Expo React Native app
    ├── /app
    │   ├── _layout.tsx                 # Root layout + providers
    │   ├── onboarding.tsx
    │   ├── how-it-works.tsx
    │   ├── (tabs)
    │   │   ├── _layout.tsx             # Bottom tab bar
    │   │   ├── index.tsx               # Dashboard
    │   │   ├── create.tsx              # Create bill wizard
    │   │   ├── activity.tsx            # Activity feed
    │   │   └── profile.tsx             # Wallet & profile
    │   └── bill
    │       └── [address].tsx           # Bill detail (deep link)
    ├── /components
    │   ├── /ui                         # Base reusable components
    │   │   ├── AppButton.tsx
    │   │   ├── AppCard.tsx
    │   │   ├── AppBadge.tsx
    │   │   ├── AppSkeleton.tsx
    │   │   ├── AddressBadge.tsx
    │   │   └── MonAmount.tsx
    │   ├── /bill
    │   │   ├── BillCard.tsx
    │   │   ├── BillProgress.tsx
    │   │   ├── BillStatusBadge.tsx
    │   │   ├── ParticipantRow.tsx
    │   │   ├── PayButton.tsx
    │   │   ├── ActionCard.tsx
    │   │   ├── TransactionFeed.tsx
    │   │   └── CountdownTimer.tsx
    │   ├── /create
    │   │   ├── StepOne.tsx
    │   │   ├── StepTwo.tsx
    │   │   ├── StepThree.tsx
    │   │   ├── StepProgress.tsx
    │   │   └── ParticipantInput.tsx
    │   └── /shared
    │       ├── WalletConnectButton.tsx
    │       ├── WrongNetworkSheet.tsx
    │       ├── SuccessModal.tsx
    │       └── StatsRow.tsx
    ├── /contracts
    │   ├── SplitFactory.json           # ABI — auto-copied by deploy script
    │   └── SplitBill.json
    ├── /hooks
    │   ├── useWallet.ts
    │   ├── useSplitFactory.ts
    │   ├── useSplitBill.ts
    │   └── useBillEvents.ts
    ├── /lib
    │   ├── provider.ts                 # ethers.js provider setup
    │   ├── walletConnect.ts            # WalletConnect config
    │   ├── monadChain.ts              # Monad testnet chain definition
    │   ├── storage.ts                 # expo-secure-store wrapper
    │   └── format.ts                  # Address truncation, MON formatting
    ├── /store
    │   ├── walletStore.ts             # Zustand — wallet state
    │   └── uiStore.ts                 # Zustand — UI/modal state
    ├── /providers
    │   ├── Web3Provider.tsx
    │   └── QueryProvider.tsx
    ├── tailwind.config.js
    ├── app.json
    └── .env
```

---

## ENVIRONMENT VARIABLES

```env
EXPO_PUBLIC_FACTORY_ADDRESS=0x...
EXPO_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
EXPO_PUBLIC_CHAIN_ID=10143
EXPO_PUBLIC_EXPLORER_URL=https://testnet.monadexplorer.com
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
PRIVATE_KEY=your_deployer_private_key
```

Get a WalletConnect Project ID free at https://cloud.reown.com

---

## DEMO FLOW (for hackathon judges)

Structure the app so a judge can follow this in under 3 minutes on a real device:

```
1. Open app on Phone A → connect wallet (MetaMask Mobile via WalletConnect)
2. Tap "Create" → fill bill details → add Phone B wallet address → deploy
3. Tap "Share with Friends" → sends deep link via WhatsApp / AirDrop
4. Open link on Phone B → app opens to bill detail screen → "Pay Now"
5. Payment confirms in under 1 second — Phone A dashboard updates live
6. Phone A: bill shows "Settled" → tap "Withdraw Funds"
7. Show both transactions on Monad explorer — each under 1 second
```

---

## DELIVERABLES CHECKLIST

- [ ] SplitFactory.sol and SplitBill.sol with all functions, events, and security guards
- [ ] ReentrancyGuard on all fund transfer functions
- [ ] Refund logic for cancelled and expired bills
- [ ] Hardhat deploy script that auto-saves ABI to /mobile/contracts/
- [ ] Contract deployed on Monad testnet
- [ ] Expo project bootstrapped with TypeScript, NativeWind, Expo Router
- [ ] WalletConnect integration with Monad testnet pre-configured
- [ ] Wrong network detection with bottom sheet prompt to switch
- [ ] Onboarding screen with wallet connect flow
- [ ] Bottom tab navigator with 4 tabs
- [ ] Dashboard with "Bills I Created" and "Bills I'm In" tabs
- [ ] Three-step Create Bill wizard with animated transitions
- [ ] Dynamic participant address input with clipboard paste support
- [ ] Live split amount calculation updating in real time
- [ ] Native share sheet on bill creation with deep link
- [ ] Bill Detail screen with role-based action card
- [ ] Deep linking: splitpay://bill/[address] opens correct screen
- [ ] Animated progress ring for bill payment progress
- [ ] Countdown timer for deadline bills
- [ ] Transaction history feed with Monad explorer links
- [ ] Activity screen with event feed across all bills
- [ ] Profile screen with wallet info and stats
- [ ] Haptic feedback on successful on-chain actions
- [ ] Pull-to-refresh on all list screens
- [ ] Skeleton loaders on all data-fetching states
- [ ] Status polling every 3 seconds with React Query
- [ ] Works on both iOS and Android
- [ ] .env.example with all variables documented
- [ ] README with setup, build instructions and judge demo flow
