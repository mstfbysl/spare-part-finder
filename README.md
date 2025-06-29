# 📘 Spare Part Finder - Dummy API

A comprehensive mock API for VIN-based vehicle lookup, spare part suggestion, and B2B inventory responses. This API simulates real-world automotive spare part discovery systems with AI-based text interpretation capabilities.

## ✅ Purpose

This API is designed to:
- Test and prototype AI-based spare part discovery systems
- Simulate VIN-based vehicle identification
- Provide mock B2B inventory responses
- Support Turkish language automotive terminology
- Enable frontend development without real backend dependencies

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express | Backend server framework |
| uuid | Generate unique mock IDs |
| dotenv | Environment variable management |
| cors | Cross-origin resource sharing |
| nodemon | Development server auto-restart |

## 🗂️ Project Structure

```
spare-part-finder/
├── controllers/
│   ├── vehicleController.js    # Vehicle lookup logic
│   ├── partController.js       # Part suggestion & AI interpretation
│   └── sellerController.js     # Seller matching & request handling
├── data/
│   ├── mockVehicles.json      # 50+ sample vehicles
│   ├── mockParts.json         # 385+ parts across 7 categories
│   └── mockSellers.json       # 50+ sellers with contact info
├── routes/
│   ├── vehicleRoutes.js       # Vehicle API endpoints
│   ├── partRoutes.js          # Parts API endpoints
│   └── sellerRoutes.js        # Seller API endpoints
├── utils/
│   └── matchUtils.js          # AI text interpretation & utilities
├── app.js                     # Express app configuration
├── server.js                  # Server startup & process management
├── package.json               # Dependencies & scripts
├── .env                       # Environment variables
└── README.md                  # This file
```

## 🔌 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd spare-part-finder

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# Or start production server
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

## 🚀 API Endpoints

### Base URL
```
http://localhost:5000
```

### 🚗 Vehicle Endpoints

#### Get Vehicle by VIN
```http
GET /api/vehicle/:vin
```

**Example:**
```bash
curl http://localhost:5000/api/vehicle/WDB2020201F685790
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vin": "WDB2020201F685790",
    "make": "Mercedes-Benz",
    "model": "A180",
    "year": 2020,
    "categories": ["Motor", "Fren", "Gövde", "Elektrik", "Süspansiyon", "Klima", "İç Aksam"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Search Vehicles
```http
GET /api/vehicle/search?make=Mercedes&model=A180&year=2020
```

### 🔧 Parts Endpoints

#### Get Parts by Category
```http
GET /api/parts/:vin/:category
```

**Example:**
```bash
curl http://localhost:5000/api/parts/WDB2020201F685790/Fren
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "vin": "WDB2020201F685790",
      "make": "Mercedes-Benz",
      "model": "A180",
      "year": 2020
    },
    "category": "Fren",
    "parts": [
      { "name": "Fren Balatası Ön", "id": "part-fren-001" },
      { "name": "Fren Balatası Arka", "id": "part-fren-002" },
      { "name": "Fren Diski Ön", "id": "part-fren-003" }
    ],
    "count": 55
  }
}
```

#### AI Part Interpretation
```http
POST /api/parts/interpret
Content-Type: application/json

{
  "vin": "WDB2020201F685790",
  "description": "fren tutmuyor arka kısımdan ses geliyor"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "vin": "WDB2020201F685790",
      "make": "Mercedes-Benz",
      "model": "A180",
      "year": 2020
    },
    "suggestedPart": {
      "name": "Fren Balatası Arka",
      "id": "part-fren-002",
      "confidence": 0.87
    },
    "analysis": {
      "originalDescription": "fren tutmuyor arka kısımdan ses geliyor",
      "detectedKeywords": 3,
      "category": "fren",
      "confidenceLevel": "Yüksek"
    },
    "recommendations": [
      "Bu parça tahmini yüksek güvenilirlik seviyesinde",
      "Fren parçaları güvenlik açısından kritiktir, profesyonel montaj önerilir"
    ]
  }
}
```

#### Get Vehicle Categories
```http
GET /api/parts/:vin/categories
```

#### Search Parts
```http
GET /api/parts/search?query=fren&category=Fren
```

### 🏪 Seller Endpoints

#### Get Sellers for Part
```http
GET /api/sellers/:partId
```

**Example:**
```bash
curl http://localhost:5000/api/sellers/part-fren-001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "partId": "part-fren-001",
    "sellers": [
      {
        "name": "ParçaDükkanı",
        "location": "Ankara",
        "price": 340,
        "stock": 5,
        "rating": 4.6,
        "deliveryTime": "2-3 gün",
        "warranty": "1 yıl garanti",
        "paymentMethods": ["Nakit", "Kredi Kartı", "Havale"]
      }
    ],
    "count": 4,
    "priceRange": {
      "min": 340,
      "max": 365,
      "average": 353
    }
  }
}
```

#### Create Part Request
```http
POST /api/sellers/request
Content-Type: application/json

{
  "vin": "WDB2020201F685790",
  "partId": "part-fren-001",
  "userEmail": "user@example.com",
  "description": "Acil ihtiyaç",
  "urgency": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "req-1705312200000-1234",
    "status": "pending",
    "estimatedResponse": "4-8 saat",
    "message": "Talebiniz başarıyla oluşturuldu. Satıcılar en kısa sürede sizinle iletişime geçecek.",
    "notificationsSent": 6
  }
}
```

#### Get Request Status
```http
GET /api/sellers/request/:requestId
```

## 🧪 Sample Data

### Mock Vehicles (50+ entries)
- **Mercedes-Benz**: A180, C200, E220, S350
- **BMW**: 320i, 520d, X3, X5
- **Audi**: A3, A4, Q5, Q7
- **Volkswagen**: Golf, Passat, Tiguan
- **Ford**: Focus, Mondeo, Kuga
- **Renault**: Clio, Megane, Kadjar
- **Peugeot**: 208, 308, 3008
- **Fiat**: Punto, Tipo, 500X
- **Toyota**: Corolla, Camry, RAV4
- **Hyundai**: i20, i30, Tucson

### Mock Parts (385+ entries across 7 categories)
1. **Motor** (55 parts): Piston, Silindir Kapağı, Turbo, Enjektör, etc.
2. **Fren** (55 parts): Balata, Disk, Kaliper, ABS Sensörü, etc.
3. **Elektrik** (55 parts): Akü, Alternatör, Far, Sigorta, etc.
4. **Gövde** (55 parts): Kaput, Kapı, Tampon, Cam, etc.
5. **Süspansiyon** (55 parts): Amortisör, Yay, Salıncak, Rotil, etc.
6. **Klima** (55 parts): Kompresör, Kondenser, Filtre, Gaz, etc.
7. **İç Aksam** (55 parts): Koltuk, Kemer, Dashboard, Döşeme, etc.

### Mock Sellers (50+ entries)
- Distributed across major Turkish cities
- Realistic contact information
- Specialization areas
- Rating systems (4.2-4.9 stars)
- Establishment years (1985-2011)

## 🤖 AI Text Interpretation

The API includes sophisticated Turkish language processing for automotive symptoms:

### Supported Keywords by Category

**Fren (Brake)**: fren, balata, disk, durmuyor, tutmuyor, gıcırdıyor, ses, titreşim, pedal

**Motor (Engine)**: motor, çalışmıyor, titreşim, ses, duman, yağ, soğutma, ısınma, güç, performans

**Elektrik (Electrical)**: elektrik, akü, şarj, çalışmıyor, ışık, far, sinyal, klakson, cam

**Süspansiyon (Suspension)**: amortisör, yay, salıncak, direksiyon, titreşim, sarsıntı, ses, çukur

**Klima (Climate)**: klima, soğutmuyor, ısıtmıyor, hava, fan, filtre, gaz, kompresör

### Confidence Levels
- **Yüksek (High)**: 80%+ confidence
- **Orta (Medium)**: 60-79% confidence  
- **Düşük (Low)**: 40-59% confidence
- **Çok Düşük (Very Low)**: <40% confidence

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start

# Run tests (if implemented)
npm test

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

## 🔧 API Features

### Request/Response Features
- ✅ Realistic API delays (100-1000ms)
- ✅ Comprehensive error handling
- ✅ Request logging with timestamps
- ✅ CORS support for frontend integration
- ✅ JSON request/response validation
- ✅ Graceful server shutdown

### Business Logic Features
- ✅ VIN format validation
- ✅ Turkish automotive terminology
- ✅ Dynamic seller generation
- ✅ Price range calculations
- ✅ Stock level simulation
- ✅ Warranty information
- ✅ Delivery time estimates
- ✅ Request status tracking

### Data Features
- ✅ 50+ realistic vehicle entries
- ✅ 385+ automotive parts
- ✅ 50+ seller profiles
- ✅ Multi-category organization
- ✅ Realistic pricing structures
- ✅ Geographic distribution

## 🌐 API Documentation

Visit `http://localhost:5000/api` for interactive API documentation with:
- Complete endpoint listing
- Sample request/response examples
- Parameter descriptions
- Error code explanations

## 🔍 Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Sample Test Sequence
```bash
# 1. Get vehicle info
curl http://localhost:5000/api/vehicle/WDB2020201F685790

# 2. Get brake parts
curl http://localhost:5000/api/parts/WDB2020201F685790/Fren

# 3. Interpret problem description
curl -X POST http://localhost:5000/api/parts/interpret \
  -H "Content-Type: application/json" \
  -d '{"vin":"WDB2020201F685790","description":"fren tutmuyor ses var"}'

# 4. Get sellers for a part
curl http://localhost:5000/api/sellers/part-fren-001

# 5. Create a part request
curl -X POST http://localhost:5000/api/sellers/request \
  -H "Content-Type: application/json" \
  -d '{"vin":"WDB2020201F685790","partId":"part-fren-001","userEmail":"test@example.com"}'
```

## 🚨 Error Handling

The API provides comprehensive error responses:

```json
{
  "error": "Vehicle not found",
  "message": "No vehicle found with VIN: INVALID123456789",
  "suggestion": "Please check the VIN and try again",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Codes
- `400`: Bad Request (Invalid input)
- `
