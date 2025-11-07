# API Usage Examples

## Authentication

### 1. Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mastersolis.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@mastersolis.com",
    "role": "admin"
  }
}
```

### 2. Using the Token
Save the token and use it in subsequent requests:
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/contact-messages \
  -H "Authorization: Bearer $TOKEN"
```

## Homepage API

### Get Homepage
```bash
curl http://localhost:3000/api/homepage
```

### Create/Update Homepage
```bash
curl -X POST http://localhost:3000/api/homepage \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to Mastersolis",
    "subtitle": "Transforming Ideas Into Digital Reality",
    "description": "Empowering businesses with cutting-edge AI and technology solutions",
    "hero_image": "https://example.com/hero.jpg",
    "stats": {
      "projects": 500,
      "clients": 200,
      "awards": 50
    }
  }'
```

## About API

### Get About
```bash
curl http://localhost:3000/api/about
```

### Create/Update About
```bash
curl -X POST http://localhost:3000/api/about \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mission": "To empower businesses worldwide...",
    "vision": "To be the global leader...",
    "values": "Innovation, integrity, excellence...",
    "journey": [
      {
        "year": "2018",
        "title": "Foundation",
        "description": "Started with a vision..."
      }
    ],
    "team": [
      {
        "name": "John Anderson",
        "role": "CEO & Founder",
        "image": "https://example.com/john.jpg"
      }
    ]
  }'
```

## Services API

### Get All Services
```bash
curl http://localhost:3000/api/services
```

### Get Single Service
```bash
curl http://localhost:3000/api/services/1
```

### Create Service
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI & Machine Learning",
    "description": "Harness the power of AI...",
    "icon": "fas fa-brain",
    "category": "ai",
    "features": [
      "Custom AI model development",
      "Natural Language Processing"
    ],
    "benefits": [
      "Reduce operational costs by 40%",
      "Improve decision-making"
    ]
  }'
```

### Update Service
```bash
curl -X PUT http://localhost:3000/api/services/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Service Title",
    "description": "Updated description..."
  }'
```

### Delete Service
```bash
curl -X DELETE http://localhost:3000/api/services/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Contact Messages API

### Get All Contact Messages (with pagination)
```bash
curl "http://localhost:3000/api/contact-messages?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Contact Message
```bash
curl http://localhost:3000/api/contact-messages/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Contact Message
```bash
curl -X DELETE http://localhost:3000/api/contact-messages/1 \
  -H "Authorization: Bearer $TOKEN"
```

## JavaScript/Fetch Examples

### Login and Store Token
```javascript
async function login() {
  const response = await fetch('http://localhost:3000/api/auth/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@mastersolis.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('adminToken', data.token);
    return data.token;
  }
}
```

### Fetch Contact Messages
```javascript
async function getContactMessages() {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch('http://localhost:3000/api/contact-messages?page=1&limit=50', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
}
```

### Create Service
```javascript
async function createService(serviceData) {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch('http://localhost:3000/api/services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(serviceData)
  });
  
  const data = await response.json();
  return data;
}
```

