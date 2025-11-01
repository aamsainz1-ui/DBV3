# True Wallet Dashboard - DBV3

ระบบจัดการและติดตามยอดเงิน True Wallet พร้อมประวัติรายการธุรกรรมและกราฟแนวโน้มรายรับ

## 🌟 ฟีเจอร์หลัก

- 📊 **Dashboard หลัก**: แสดงยอดเงินและสถานะการเชื่อมต่อ API
- 💰 **ติดตามยอดเงิน**: ดูยอดคงเหลือแบบ real-time  
- 📈 **กราฟแนวโน้ม**: แสดงยอดรับเงินรายวัน 7 วันล่าสุด
- 🔍 **ค้นหาธุรกรรม**: ค้นหาประวัติการรับโอนเงินด้วยเบอร์โทรศัพท์
- 📱 **Responsive Design**: รองรับการใช้งานบนทุกอุปกรณ์
- 🎨 **Purple Theme**: ธีมสีม่วงที่สวยงามและใช้งานง่าย

## 🚀 Live Demo

**URL**: https://lhd7v4llxkob.space.minimax.io

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component Library
- **Lucide React** - Icons
- **Sonner** - Toast Notifications

### Backend
- **Supabase** - Database & Edge Functions
- **PostgreSQL** - Database
- **Deno** - Edge Function Runtime

### API Integration
- **True Wallet API** - ดึงข้อมูลยอดเงินและธุรกรรม
- **Transaction History** - เก็บประวัติการรับเงิน

## 📦 การติดตั้ง

### 1. Clone Repository
```bash
git clone https://github.com/aamsainz1-ui/DBV3.git
cd DBV3
```

### 2. ติดตั้ง Dependencies
```bash
npm install
# หรือ
pnpm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Build และ Run
```bash
# Development
npm run dev

# Production Build
npm run build
npm run preview
```

## 🗃️ โครงสร้างโปรเจค

```
DBV3/
├── src/                    # Frontend Source Code
│   ├── components/         # React Components
│   ├── hooks/             # Custom Hooks
│   ├── lib/               # Utilities
│   ├── services/          # API Services
│   ├── types/             # TypeScript Types
│   └── data/              # Mock Data
├── supabase/              # Backend Functions
│   └── functions/         # Edge Functions
│       └── daily-income-summary/
├── public/                # Static Assets
├── dist/                  # Build Output
└── README.md             # Documentation
```

## 🔧 การตั้งค่า Supabase

### 1. สร้าง Tables
```sql
-- Transaction History Table
CREATE TABLE transaction_history (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  transaction_date DATE NOT NULL,
  transaction_time TIME,
  phone_number VARCHAR(20),
  amount DECIMAL(15,2) NOT NULL,
  transaction_id VARCHAR(255),
  status VARCHAR(50),
  description TEXT,
  source_type VARCHAR(50) NOT NULL
);

-- Daily Exports Table
CREATE TABLE daily_exports (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  export_date DATE NOT NULL,
  file_path TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  total_records INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0
);
```

### 2. Deploy Edge Functions
```bash
supabase functions deploy daily-income-summary
```

## 📊 ข้อมูลปัจจุบัน

- **วันที่อัพเดทล่าสุด**: 2025-11-01
- **ยอดรับเงินวันนี้**: ฿9,920.19 (73 รายการ)
- **แหล่งข้อมูล**: transaction_history (recent_transactions)
- **ช่วงข้อมูล**: 7 วันล่าสุด (26 ต.ค. - 1 พ.ย. 2025)

## 🎯 API Endpoints

### Daily Income Summary
```
GET /functions/v1/daily-income-summary
```
ส่งคืนข้อมูลสรุปยอดรับเงินรายวัน 7 วันล่าสุด

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-11-01",
      "dateLabel": "1 พ.ย.",
      "dailyIncome": 9920.19,
      "transactionCount": 73
    }
  ],
  "summary": {
    "totalDays": 7,
    "totalIncome": 9920.19,
    "totalTransactions": 73
  }
}
```

## 🐛 การแก้ไขปัญหา

### CORS Errors
หากพบปัญหา CORS ให้ใช้:
1. Browser Extension (CORS Unblock)
2. หรือใช้ Proxy Server

### API Token Issues
ตรวจสอบ True Wallet API Tokens ในการตั้งค่า

### Build Errors
```bash
npm run clean
npm install
npm run build
```

## 👨‍💻 ผู้พัฒนา

**MiniMax Agent** - AI Assistant สำหรับการพัฒนาเว็บแอปพลิเคชัน

## 📄 License

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE)

## 🔗 Links

- [Live Demo](https://lhd7v4llxkob.space.minimax.io)
- [GitHub Repository](https://github.com/aamsainz1-ui/DBV3.git)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

⭐ หากโปรเจคนี้มีประโยชน์ อย่าลืมให้ดาวใน GitHub!