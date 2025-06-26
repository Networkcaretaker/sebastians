# Restaurant QR Menu App

A modern React-based restaurant management system with a custom CMS for menu administration, Firebase Cloud Functions for static menu generation, and a mobile-optimized public menu display accessed via QR codes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10+-orange.svg)

## 🎯 Project Overview

This system provides restaurant owners with an intuitive admin interface to manage their menus, Firebase Cloud Functions to generate optimized static JSON files, and customers with a fast, mobile-optimized menu experience accessible via QR codes. Built with modern web technologies and designed for performance, accessibility, and cost-effectiveness.

### Key Features

**Admin CMS:**
- 🔐 Secure Firebase authentication and authorization
- 📱 Mobile-responsive admin interface
- 🍽️ Complete menu item and category management
- 📊 Website publishing and management system
- 🎨 Theme customization options
- 📈 Real-time menu updates and preview
- 🚀 One-click menu publishing via Cloud Functions

**Firebase Cloud Functions:**
- ⚡ Static JSON menu generation for optimal performance
- 🗄️ Automated Firebase Storage file management
- 📦 Optimized data structure for customer apps
- 🔄 Real-time publishing workflow
- 💰 Cost-effective alternative to live database queries

**Public Menu:**
- ⚡ Lightning-fast loading with pre-generated JSON (<2 seconds on 3G)
- 📱 Mobile-first responsive design
- 🔍 Easy menu browsing and navigation
- ♿ WCAG 2.1 AA accessibility compliant
- 🌐 PWA capabilities for app-like experience
- 📶 Offline-first functionality

## 🏗️ System Architecture

### Core Components
- **Admin CMS** (`apps/admin/`) - Restaurant management interface at `admin.sebastians.com`
- **Firebase Functions** (`functions/`) - Server-side menu processing and JSON generation
- **Public Menu** (`apps/menu/`) - Customer-facing menu display at `sebastians.com`
- **Shared Packages** (`packages/`) - Reusable components, types, and utilities
- **Firebase Backend** - Firestore database, authentication, hosting, and storage

### Data Flow
```
Restaurant Staff → Admin CMS → Firebase Functions → JSON Generation → Firebase Storage → Public Menu → QR Code → Customers
```

### Performance Architecture
```
Traditional Approach:          New Static Approach:
Customer → Firestore Queries   Customer → Pre-generated JSON
(10+ reads per menu view)      (1 file fetch per menu)
High cost, slower loading      Low cost, instant loading
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite for fast development and optimized builds
- **Styling:** Tailwind CSS for responsive, utility-first styling
- **State Management:** React Context + useReducer
- **Routing:** React Router v6
- **Forms:** React Hook Form with validation

### Backend & Infrastructure  
- **Database:** Firebase Firestore (NoSQL document database)
- **Functions:** Firebase Cloud Functions with TypeScript
- **Authentication:** Firebase Auth with email/password
- **Storage:** Firebase Storage for static JSON files and images
- **Hosting:** Firebase Hosting with CDN
- **Security:** Firestore Security Rules

### Development Tools
- **Monorepo:** npm workspaces
- **Type Safety:** TypeScript with strict mode
- **Code Quality:** ESLint, Prettier
- **Testing:** Firebase Functions Test (implemented)
- **CI/CD:** Firebase CLI deployment pipeline

## 📁 Project Structure

```
sebastians/
├── apps/
│   ├── admin/                    # Admin CMS application
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   ├── pages/           # Route-level components
│   │   │   ├── context/         # React Context providers
│   │   │   ├── services/        # Firebase service functions
│   │   │   └── types/           # TypeScript type definitions
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── menu/                     # Public menu application
│       ├── src/
│       │   ├── components/       # React components
│       │   ├── pages/           # Route-level components
│       │   ├── services/        # Firebase service functions
│       │   └── types/           # TypeScript type definitions
│       ├── package.json
│       └── vite.config.ts
├── functions/                    # 🔥 Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts             # Main functions (exportMenu, helloWorld)
│   ├── package.json
│   └── tsconfig.json
├── packages/
│   ├── shared-types/            # Shared TypeScript types
│   ├── firebase-config/         # Firebase configuration
│   └── ui-components/           # Reusable UI components
├── firebase.json                # Firebase configuration
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Database indexes
├── .firebaserc                 # Firebase project aliases
├── package.json                # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 8+ or **yarn** 1.22+
- **Firebase CLI** (install with `npm install -g firebase-tools`)
- **Git** for version control

### Installation

1. **Clone the repository:**
   ```cmd
   git clone https://github.com/yourusername/sebastians.git
   cd sebastians
   ```

2. **Install dependencies:**
   ```cmd
   npm install
   ```

3. **Set up Firebase configuration:**
   ```cmd
   # Login to Firebase
   firebase login
   
   # Connect to your Firebase project
   firebase use --add
   
   # List available projects
   firebase projects:list
   ```

4. **Create environment files:**
   ```cmd
   # Admin app environment
   copy apps\admin\.env.example apps\admin\.env.local
   
   # Menu app environment  
   copy apps\menu\.env.example apps\menu\.env.local
   ```

5. **Install Firebase Functions dependencies:**
   ```cmd
   cd functions
   npm install
   cd ..
   ```

6. **Start development servers:**
   ```cmd
   # Start Firebase emulators (recommended for development)
   firebase emulators:start
   
   # In separate terminals:
   # Start admin app
   npm run dev:admin    # http://localhost:3000
   
   # Start menu app
   npm run dev:menu     # http://localhost:3001
   
   # Or start both apps
   npm run dev:all
   ```

### Environment Variables

Create `.env.local` files in both `apps/admin/` and `apps/menu/` directories:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# App Configuration
VITE_APP_NAME=Sebastian's Restaurant
VITE_ENVIRONMENT=development
```

## 🔥 Firebase Functions

### Functions Overview

**Location:** `functions/src/index.ts`

#### `exportMenu` (HTTP Callable Function)
Generates optimized static JSON files for published menus.

**Input:**
```typescript
{
  menuId: string
}
```

**Process:**
1. Fetches menu document from Firestore
2. Retrieves all associated categories and menu items
3. Constructs complete nested menu structure
4. Generates formatted JSON file
5. Saves to Firebase Storage with public access
6. Returns public URL for immediate access

**Output:**
```typescript
{
  success: boolean;
  message: string;
  data: CompleteMenuStructure;
  url?: string; // Public Firebase Storage URL
}
```

#### `helloWorld` (HTTP Request Function)
Simple test function for verifying Functions deployment.

### Functions Development

```cmd
# Install dependencies
cd functions
npm install

# Build functions
npm run build

# Start Functions emulator
npm run serve

# Deploy functions
npm run deploy

# View function logs
npm run logs
```

### Functions Deployment

```cmd
# Deploy functions only
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:exportMenu

# View deployment status
firebase functions:list
```

## 📊 Database Schema

### Firestore Collections

**menus**
```typescript
{
  id: string;
  menu_name: string;
  menu_description: string;
  menu_type: 'web' | 'printable';
  categories: string[]; // Array of category IDs in order
  isActive: boolean;
  publishStatus: 'draft' | 'published' | 'unpublished';
  publishedAt?: Date;
  publishedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  menu_order: number;
}
```

**categories**
```typescript
{
  id: string;
  cat_name: string;
  cat_description: string;
  extras: MenuItemExtra[];
  addons: MenuItemAddon[];
  items: string[]; // Array of item IDs
  header: string;
  footer: string;
}
```

**menu_items**
```typescript
{
  id: string;
  item_name: string;
  item_description: string;
  category: string;
  price: number;
  options: MenuItemOption[];
  extras: MenuItemExtra[];
  addons: MenuItemAddon[];
  flags: {
    active: boolean;
    vegetarian: boolean;
    extras: boolean;
    addons: boolean;
    options: boolean;
  };
  allergies: string[];
  menu_order: number;
}
```

**websiteConfig**
```typescript
{
  restaurant: {
    name: string;
    description: string;
    contactInfo: ContactInfo;
  };
  publishedMenus: Array<{
    id: string;
    name: string;
    publishedUrl: string;
    publishedAt: Date;
  }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  lastUpdated: Date;
  createdAt: Date;
}
```

## 🛠️ Development Commands

### Root Level Commands
```cmd
# Development
npm run dev:all              # Start both admin and menu apps
npm run dev:admin            # Start admin app only
npm run dev:menu             # Start menu app only

# Building
npm run build:all            # Build both apps
npm run build:admin          # Build admin app
npm run build:menu           # Build menu app

# Testing
npm run test                 # Run all tests
npm run test:admin           # Run admin app tests
npm run test:menu            # Run menu app tests
npm run test:functions       # Run Firebase Functions tests

# Linting & Formatting
npm run lint                 # Lint all code
npm run lint:fix             # Fix linting issues
npm run format               # Format code with Prettier

# Firebase Deployment
npm run deploy:all           # Deploy apps and functions
npm run deploy:admin         # Deploy admin app only
npm run deploy:menu          # Deploy menu app only
npm run deploy:functions     # Deploy functions only
```

### Firebase Commands
```cmd
# Emulators
firebase emulators:start                    # Start all emulators
firebase emulators:start --only functions   # Functions only
firebase emulators:start --only firestore   # Firestore only
firebase emulators:start --only hosting     # Hosting only

# Functions
firebase functions:shell                    # Interactive functions shell
firebase functions:log                      # View function logs
firebase functions:log --only exportMenu    # Specific function logs

# Deployment
firebase deploy                             # Deploy everything
firebase deploy --only hosting             # Hosting only
firebase deploy --only functions           # Functions only
firebase deploy --only firestore           # Firestore rules only

# Project Management
firebase use                                # Show current project
firebase use --add                          # Add project alias
firebase projects:list                      # List available projects
```

## 📋 Firebase Hosting Configuration

The project uses Firebase Hosting with multiple targets for different apps:

**Configuration** (`firebase.json`):
```json
{
  "hosting": [
    {
      "target": "menu",
      "public": "apps/menu/dist",
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "target": "admin", 
      "public": "apps/admin/dist",
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ],
  "functions": {
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

**Hosting Targets Setup:**
```cmd
# Configure hosting targets
firebase target:apply hosting admin your-admin-site-id
firebase target:apply hosting menu your-menu-site-id

# Deploy to specific targets
firebase deploy --only hosting:admin
firebase deploy --only hosting:menu
```

## 🔒 Security

### Firestore Security Rules

**Current Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Menu items, categories, menus - require authentication
    match /menu_items/{document} {
      allow read, write: if request.auth != null;
    }
    match /categories/{document} {
      allow read, write: if request.auth != null;
    }
    match /menus/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Website configuration - public read, auth write
    match /websiteConfig/default {
      allow read: if true; // Public read for menu app
      allow write: if request.auth != null;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Authentication & Authorization
- Firebase Auth with email/password authentication
- Admin-only access control for CMS functions
- Protected routes for admin-only access
- Firebase Functions security via authentication context

### Data Protection
- Input validation and sanitization
- XSS and CSRF protection considerations
- Secure file upload with type validation
- Environment variable protection

## 📈 Performance

### Performance Targets
- **Customer App Initial Load:** <2 seconds on 3G connection
- **Menu Switch:** <0.5 seconds (pre-generated JSON)
- **Admin App Time to Interactive:** <3 seconds
- **Lighthouse Score:** >90 for Performance, Accessibility, Best Practices
- **Bundle Size:** <500KB initial load for customer app
- **Function Execution:** <10 seconds for menu generation

### Static Menu Generation Benefits
- **Cost Reduction:** 95%+ reduction in Firestore reads
- **Performance:** Sub-second menu loading
- **Scalability:** No database bottlenecks during high traffic
- **Offline Support:** JSON files enable offline menu viewing
- **CDN Optimization:** Firebase Hosting CDN delivery

### Optimization Techniques
- Static JSON generation via Firebase Functions
- Code splitting with dynamic imports
- Efficient Firestore queries with minimal reads
- Firebase Hosting CDN for global delivery
- Service worker implementation for offline functionality

## 🚀 Deployment

### Development Workflow
1. **Local Development:** Vite dev servers with Firebase emulators
2. **Functions Testing:** Firebase Functions emulator
3. **Staging:** Firebase hosting preview channels
4. **Production:** Firebase hosting with custom domains
5. **Monitoring:** Firebase console logging and monitoring

### Complete Deployment Process

**1. Build Applications:**
```cmd
# Build all applications
npm run build:all

# Verify builds
dir apps\admin\dist
dir apps\menu\dist
```

**2. Deploy Functions:**
```cmd
# Build and deploy functions
cd functions
npm run build
npm run deploy

# Or from root
firebase deploy --only functions
```

**3. Deploy Hosting:**
```cmd
# Deploy both apps
firebase deploy --only hosting

# Or deploy individually
firebase deploy --only hosting:admin
firebase deploy --only hosting:menu
```

**4. Deploy Database Rules:**
```cmd
# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

**5. Complete Deployment:**
```cmd
# Deploy everything at once
firebase deploy
```

### Production Checklist
- [ ] Environment variables configured for production
- [ ] Firebase project set to production
- [ ] Functions deployed and tested
- [ ] Hosting targets configured
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active
- [ ] Firestore security rules deployed
- [ ] Performance monitoring enabled

## ♿ Accessibility

This application follows WCAG 2.1 AA guidelines:
- Semantic HTML structure with proper heading hierarchy
- Keyboard navigation support throughout
- Screen reader compatibility with ARIA labels
- High contrast mode support
- Minimum 44px touch targets for mobile interaction
- Alt text for all images and visual content
- Focus management for dynamic content updates
- Color is not the only means of conveying information

## 🔧 Troubleshooting

### Common Issues

**Functions Deployment Errors:**
```cmd
# Check Functions logs
firebase functions:log

# Redeploy specific function
firebase deploy --only functions:exportMenu

# Test locally
cd functions
npm run serve
```

**Build Errors:**
```cmd
# Clear cache and reinstall dependencies
npm run clean
npm install

# Check TypeScript errors
npm run type-check

# Build with verbose output
npm run build:admin -- --verbose
```

**Firebase Connection Issues:**
```cmd
# Verify Firebase configuration
firebase projects:list
firebase use [project-id]

# Check authentication
firebase login:list

# Test connection
firebase firestore:indexes
```

**Development Server Issues:**
```cmd
# Kill processes using ports 3000/3001
npx kill-port 3000 3001

# Clear Vite cache
npx vite --force

# Restart development servers
npm run dev:all
```

### Windows-Specific Issues

**Long Path Names:**
```cmd
# Enable long paths in Windows (run as Administrator)
git config --system core.longpaths true

# Or via PowerShell (Administrator)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

**Permission Errors:**
```cmd
# Run Command Prompt as Administrator
# Or use PowerShell with execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Firebase CLI Issues:**
```cmd
# Reinstall Firebase CLI
npm uninstall -g firebase-tools
npm install -g firebase-tools

# Clear npm cache
npm cache clean --force
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Test changes locally including Functions:** 
   ```cmd
   firebase emulators:start
   npm run test:functions
   npm run dev:all
   ```
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new Firebase Functions
- Update documentation as needed
- Test Functions deployment before submitting PR

## 📋 Roadmap

### Phase 1: Core Foundation ✅
- Basic CRUD operations for menu management
- Firebase authentication and authorization
- Mobile-responsive admin interface
- Firebase Functions for static menu generation
- Public menu display with QR code access

### Phase 2: Enhanced Features 🚧
- Website management interface (✅ In Progress)
- Advanced menu publishing workflow
- QR code generation and management
- Enhanced theme customization
- Menu analytics and insights

### Phase 3: Advanced Capabilities 📋
- Multi-restaurant support
- Customer feedback integration
- Advanced SEO optimization
- Performance analytics dashboard
- Automated menu scheduling

### Future Integrations 🔮
- POS system integration
- Online ordering capabilities
- Inventory management
- Customer loyalty programs
- Third-party delivery platforms

## 📞 Support

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Getting Help
- **Issues:** Open an issue on GitHub with detailed reproduction steps
- **Functions Issues:** Include function logs and error messages
- **Discussions:** Use GitHub Discussions for questions
- **Security:** Report security issues privately

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for providing excellent backend infrastructure and Functions platform
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the lightning-fast build tool
- **TypeScript** for type safety and developer experience

---

**Built with ❤️ for restaurant owners who want to provide their customers with the best possible menu experience while maintaining cost-effective operations.**

## 📊 Project Status

- **Current Version:** 1.0.0
- **Status:** Active Development
- **Firebase Functions:** ✅ Deployed and Working
- **Admin CMS:** ✅ Complete with Publishing Interface
- **Customer Menu App:** ✅ Basic Implementation Complete
- **Last Updated:** June 2025
- **Maintenance:** Actively maintained

---

*This project demonstrates the power of combining React, TypeScript, and Firebase Functions to create a modern, performant, and cost-effective restaurant management system. The static menu generation approach provides excellent performance while keeping operational costs minimal.*