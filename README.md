# AyaPay — Decentralized Crypto Payroll on Celo

> Pay your global team in stablecoins. Fast, transparent, borderless.

AyaPay enables companies to onboard employees, assign salaries, and automate recurring crypto payments using the Celo blockchain.

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind CSS, Shadcn  |
| Backend    | Node.js, Express, Prisma ORM, PostgreSQL      |
| Blockchain | Celo (EVM), viem, MetaMask / MiniPay wallet   |
| Auth       | JWT, bcrypt                                   |
| Scheduling | node-cron                                     |
| Charts     | Recharts                                      |
| State      | Zustand, React Query                          |

## Project Structure

```
ayapay/
├── apps/
│   ├── frontend/                  # Next.js 15 app
│   │   ├── app/
│   │   │   ├── (auth)/            # Login, Register
│   │   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   └── page.tsx           # Landing page
│   │   ├── components/
│   │   │   ├── ui/                # Shadcn-style UI primitives
│   │   │   ├── layout/            # Sidebar, Topbar
│   │   │   ├── dashboard/         # Stat cards, charts
│   │   │   ├── employees/         # Employee dialogs
│   │   │   ├── payroll/           # Payroll dialogs
│   │   │   └── wallet/            # Wallet button
│   │   ├── store/                 # Zustand stores (auth, wallet)
│   │   ├── hooks/                 # Custom hooks
│   │   ├── lib/                   # API client, utils
│   │   └── types/                 # TypeScript types
│   └── backend/                   # Express API
│       ├── src/
│       │   ├── routes/            # auth, employees, payroll, analytics, wallets
│       │   ├── middleware/        # auth, error
│       │   ├── services/          # celo, payment
│       │   ├── jobs/              # payroll-scheduler (cron)
│       │   ├── utils/             # prisma, auth, config, validators
│       │   └── types/             # shared types
│       └── prisma/
│           └── schema.prisma      # Database schema
```

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- MetaMask browser extension (or MiniPay on mobile)
- A Celo Alfajores testnet wallet with test CELO

### 1. Clone & Install

```bash
git clone <repo>
cd ayapay
npm install
```

### 2. Configure Environment

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Required: DATABASE_URL, JWT_SECRET, CELO_ADMIN_PRIVATE_KEY

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
# Required: NEXT_PUBLIC_API_URL
```

### 3. Setup Database

```bash
cd apps/backend
npm run db:push       # Push schema to DB
npm run db:generate   # Generate Prisma client
```

### 4. Run Development

```bash
# From root — starts both frontend and backend
npm run dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Health:   http://localhost:4000/health
```

### 5. Docker (optional)

```bash
docker-compose up -d   # Starts postgres + redis + backend
```

## API Reference

### Auth
| Method | Endpoint             | Auth | Description        |
|--------|----------------------|------|--------------------|
| POST   | /api/auth/register   | —    | Register + company |
| POST   | /api/auth/login      | —    | Login              |
| GET    | /api/auth/me         | JWT  | Current user       |

### Employees
| Method | Endpoint                      | Role        | Description       |
|--------|-------------------------------|-------------|-------------------|
| GET    | /api/employees                | Any         | List employees    |
| POST   | /api/employees                | ADMIN/HR    | Add employee      |
| GET    | /api/employees/:id            | Any         | Employee profile  |
| PUT    | /api/employees/:id            | ADMIN/HR    | Update employee   |
| PATCH  | /api/employees/:id/status     | ADMIN/HR    | Suspend/resume    |
| DELETE | /api/employees/:id            | ADMIN       | Remove employee   |

### Payroll
| Method | Endpoint                      | Role        | Description       |
|--------|-------------------------------|-------------|-------------------|
| GET    | /api/payroll                  | Any         | List payrolls     |
| POST   | /api/payroll                  | ADMIN/HR    | Create payroll    |
| POST   | /api/payroll/:id/approve      | ADMIN       | Approve payroll   |
| POST   | /api/payroll/:id/execute      | ADMIN       | Execute payment   |
| POST   | /api/payroll/bulk-execute     | ADMIN       | Bulk execute      |
| POST   | /api/payroll/:id/cancel       | ADMIN/HR    | Cancel payroll    |

### Analytics
| Method | Endpoint                  | Auth | Description         |
|--------|---------------------------|------|---------------------|
| GET    | /api/analytics/overview   | JWT  | Dashboard stats     |

### Wallets
| Method | Endpoint                      | Auth | Description         |
|--------|-------------------------------|------|---------------------|
| POST   | /api/wallets/connect          | JWT  | Save wallet address |
| GET    | /api/wallets/balance/:address | JWT  | Get balances        |
| GET    | /api/wallets/me               | JWT  | My wallet           |

## Celo Network Details

| Network   | Chain ID | RPC URL                                      | Explorer                          |
|-----------|----------|----------------------------------------------|-----------------------------------|
| Alfajores | 44787    | https://alfajores-forno.celo-testnet.org     | https://alfajores.celoscan.io     |
| Mainnet   | 42220    | https://forno.celo.org                       | https://celoscan.io               |

### Getting Test CELO (Alfajores)
Visit the [Celo Alfajores Faucet](https://faucet.celo.org/alfajores) to get test tokens.

## Wallet Setup

AyaPay uses standard EVM wallets. Connect with:
- **MetaMask** — install the browser extension, add Celo Alfajores network
- **MiniPay** — Celo's mobile wallet (Opera Mini integration)
- Any EIP-1193 compatible wallet

The app will automatically prompt you to add/switch to the Celo Alfajores network on first connect.

## Supported Tokens

| Token | Network | Contract (Alfajores)                         |
|-------|---------|----------------------------------------------|
| USDC  | Celo    | 0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B   |
| cUSD  | Celo    | 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1   |
| CELO  | Celo    | Native token                                 |

## Deployment

### Frontend → Vercel
```bash
cd apps/frontend
vercel deploy
```

### Backend → Railway
1. Connect repo to Railway
2. Set root directory to `apps/backend`
3. Add environment variables
4. Deploy

### Database → Supabase
1. Create project at supabase.com
2. Copy connection string to `DATABASE_URL`
3. Run `npm run db:push`

## Roadmap

- [x] Celo chain support
- [ ] MiniPay deep integration
- [ ] Fiat-to-crypto onramp (Transak / Kotani Pay)
- [ ] Tax estimation module
- [ ] AI payroll insights
- [ ] Employee NFT identity
- [ ] DAO treasury integration
- [ ] Real-time salary streaming

## License

MIT
