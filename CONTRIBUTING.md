# 🤝 Contributing to Veo 3 Studio Pro

Thank you for considering contributing to Veo 3 Studio Pro! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Code Standards](#code-standards)
- [Testing](#testing)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone.

### Our Standards

**Positive behavior includes:**
- ✅ Being respectful and inclusive
- ✅ Accepting constructive feedback
- ✅ Focusing on what's best for the community
- ✅ Showing empathy towards others

**Unacceptable behavior includes:**
- ❌ Harassment or discriminatory language
- ❌ Trolling or insulting comments
- ❌ Publishing others' private information
- ❌ Other unprofessional conduct

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git for version control
- Code editor (VS Code recommended)
- Basic knowledge of React and TypeScript

### Find Something to Work On

1. **Check Issues**: Browse open issues on GitHub
2. **Feature Requests**: Look for `enhancement` label
3. **Bug Reports**: Look for `bug` label
4. **Documentation**: Look for `documentation` label
5. **Good First Issues**: Look for `good-first-issue` label

---

## 💻 Development Setup

### 1. Fork the Repository

Click "Fork" on GitHub: https://github.com/nihalnihalani/Oct18

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/Oct18.git
cd Oct18
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/nihalnihalani/Oct18.git
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Environment

```bash
# Create .env.local
echo "GEMINI_API_KEY=your_api_key" > .env.local
```

### 6. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 Making Changes

### Create a Feature Branch

```bash
# Update your main branch
git checkout master
git pull upstream master

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `style/` - Code style changes

**Examples:**
- `feature/add-batch-generation`
- `fix/polling-error`
- `docs/update-setup-guide`

### Make Your Changes

1. **Write Code**: Make your changes
2. **Follow Standards**: See code standards below
3. **Test Thoroughly**: Test all affected features
4. **Document**: Update relevant documentation

---

## 📤 Submitting Changes

### Before Submitting

- [ ] Code follows project standards
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No linter errors
- [ ] Feature works as expected

### Commit Messages

Follow conventional commits format:

```
type(scope): short description

Longer description if needed.

- Bullet points for details
- More context here
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(video): add batch generation support

fix(polling): correct URI extraction path

docs(readme): add deployment guide

refactor(context): simplify state management
```

### Push Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
git push origin feature/your-feature-name
```

### Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template:
   - Clear title
   - Description of changes
   - Screenshots (if UI changes)
   - Testing notes
5. Submit!

---

## 📝 Code Standards

### TypeScript

**Always use TypeScript:**
```typescript
// ✅ Good
interface VideoProps {
  src: string;
  autoPlay?: boolean;
}

// ❌ Avoid
const VideoProps = {
  src: "string",
  autoPlay: "boolean"
};
```

**Type everything:**
```typescript
// ✅ Good
const handleClick = (event: React.MouseEvent): void => {
  // ...
};

// ❌ Avoid
const handleClick = (event) => {
  // ...
};
```

### React Components

**Use functional components:**
```typescript
// ✅ Good
export default function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
}

// ❌ Avoid class components
class MyComponent extends React.Component {
  // ...
}
```

**Use hooks appropriately:**
```typescript
// ✅ Good - clear, focused hooks
const [state, setState] = useState(initial);
useEffect(() => {
  // Effect logic
}, [dependencies]);

// ❌ Avoid - too many responsibilities
const [a, setA] = useState();
const [b, setB] = useState();
const [c, setC] = useState();
// ... 20 more states
```

### File Organization

**Component structure:**
```typescript
// 1. Imports (external, then internal)
import React from 'react';
import { MyType } from '@/types';

// 2. Type definitions
interface Props {
  // ...
}

// 3. Component
export default function Component({ }: Props) {
  // 3a. Hooks
  // 3b. Handlers
  // 3c. Effects
  // 3d. Render
}
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `VideoPlayer.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatTime.ts`)
- Types: `camelCase.ts` or `index.ts`

**Variables:**
- Components: `PascalCase` (e.g., `VideoPlayer`)
- Functions: `camelCase` (e.g., `handleClick`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- React hooks: `use` prefix (e.g., `useVideoGeneration`)

### CSS/Tailwind

**Use Tailwind utilities:**
```tsx
// ✅ Good
<div className="flex items-center gap-4 bg-gray-800 rounded-lg p-4">

// ❌ Avoid custom CSS unless necessary
<div className="my-custom-container">
```

**Organize classes logically:**
```tsx
// Layout → Spacing → Colors → Effects
className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
```

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting PR, test:

**Video Generation:**
- [ ] Text to Video works
- [ ] Image to Video works
- [ ] All 5 models work
- [ ] Different resolutions work
- [ ] Error handling works

**UI/UX:**
- [ ] Responsive on mobile
- [ ] No z-index conflicts
- [ ] Smooth animations
- [ ] Loading states display correctly

**Gallery:**
- [ ] Items save to IndexedDB
- [ ] Filtering works
- [ ] Sorting works
- [ ] Download works

**Edge Cases:**
- [ ] Empty states
- [ ] Error states
- [ ] Loading states
- [ ] Large files
- [ ] Network errors

---

## 🎯 Areas We Need Help

### High Priority
- [ ] Batch video generation
- [ ] Video templates system
- [ ] Advanced editing features
- [ ] Performance optimizations
- [ ] Mobile app (React Native)

### Medium Priority
- [ ] More export formats
- [ ] Video effects/filters
- [ ] Collaborative features
- [ ] Cloud storage integration
- [ ] Keyboard shortcuts

### Documentation
- [ ] Video tutorials
- [ ] API usage examples
- [ ] Architecture diagrams
- [ ] Troubleshooting guides
- [ ] Translation to other languages

---

## 📞 Questions?

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community chat
- **Email**: nihal@example.com (update with actual email)

---

## 🙏 Recognition

Contributors will be:
- ✅ Added to CONTRIBUTORS.md
- ✅ Credited in release notes
- ✅ Mentioned in changelog
- ✅ Appreciated by the community!

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for making Veo 3 Studio Pro better!** 🎉

Every contribution, no matter how small, helps improve the project for everyone.

Happy coding! 🚀✨

