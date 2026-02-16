

# Learning with Tony – PDFer

**An intelligent study companion that converts PDF documents into interactive quizzes.**

Transform your lecture notes, textbooks, and research papers into engaging quizzes in seconds.

</div>

---

## 🎓 Features

- **PDF to Quiz Generation** – Upload any PDF and automatically generate customizable quizzes
- **Multiple Question Types** – Mix of multiple-choice, true/false, fill-in-the-blank, and short-answer questions
- **Smart Content Extraction** – Client-side PDF parsing using PDF.js for fast, private processing
- **Quiz History** – Save and revisit your generated quizzes anytime
- **Customizable Questions** – Choose between 1-20 questions per quiz
- **Instant Grading** – Get scored results with explanations for each answer
- **Beautiful UI** – Modern, responsive design with smooth animations

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pdf-to-ques
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Navigate to `http://localhost:3000`

---

## 📦 Build & Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

---

## 🏗️ Project Structure

```
├── components/              # React components
│   ├── Header.tsx          # Navigation header
│   ├── PDFDropzone.tsx     # File upload interface
│   ├── LoadingState.tsx    # Loading animations
│   ├── QuizCard.tsx        # Question display card
│   ├── QuestionTypes.tsx   # Question type renderers
│   ├── SavedQuizzes.tsx    # Quiz history view
│
├── services/               # Business logic
│   ├── pdfService.ts       # PDF text extraction
│   ├── quizService.ts      # Quiz generation algorithm
│
├── App.tsx                 # Main app component
├── types.ts                # TypeScript type definitions
├── index.tsx               # React entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🔧 Technology Stack

- **Frontend Framework** – React 19 with TypeScript
- **Build Tool** – Vite 6
- **Styling** – Tailwind CSS
- **Icons** – Lucide React
- **PDF Processing** – PDF.js (CDN)
- **State Management** – React Hooks & localStorage
- **Font** – Playfair Display & DM Sans (Google Fonts)

---

## 📝 How It Works

### 1. **Upload PDF**
   Drag and drop your PDF or click to select. Choose your desired number of questions (1-20).

### 2. **Extract Text**
   The app uses [PDF.js](services/pdfService.ts) to extract text from up to 15 pages of your PDF locally.

### 3. **Generate Quiz**
   The [quiz generation algorithm](services/quizService.ts) analyzes the text and creates:
   - **Multiple-choice questions** (40% of quiz)
   - **Fill-in-the-blank** (20%)
   - **True/False** (20%)
   - **Short-answer** (20%)

### 4. **Take & Grade**
   Answer all questions, submit, and get instant feedback with explanations.

### 5. **Save & Review**
   All quizzes are saved to your browser's localStorage for future reference.

---

## 💾 Data Storage

- **Quiz History** – Stored in `localStorage` with key `tony_quiz_history`
- **Preferences** – Question count preference saved as `tony_pref_count`
- **Privacy** – All processing happens client-side; no data is sent to external servers

---

## 🎨 Customization

### Change Color Scheme
Edit the color classes in components (e.g., `bg-[#3B82F6]`) or modify Tailwind config.

### Adjust Question Generation
Modify the algorithm in [services/quizService.ts](services/quizService.ts):
- Change `maxPagesToRead` to process more PDF pages
- Adjust `STOPWORDS` to filter different terms
- Modify question type distribution in the `typeRoll` logic

### Update UI Text
All user-facing text is in component files – search and replace as needed.

---

## 📱 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires ES2022 support and modern DOM APIs.

---

## ⚙️ Development

### Format & Lint
```bash
# Install prettier (optional)
npm install --save-dev prettier

# Format files
npx prettier --write .
```

### Type Checking
TypeScript is configured to run in strict mode. All files are checked at build time.

---

## 📄 License

This project is provided as-is for educational purposes.

---

## 💡 Future Enhancements

- [ ] AI-powered answer evaluation
- [ ] Export quizzes as PDF
- [ ] Collaborative quiz sharing
- [ ] Dark mode
- [ ] Mobile app version
- [ ] Integration with learning platforms

---

## 🐛 Troubleshooting

**"PDF.js library not loaded"**
- Ensure you're connected to the internet (CDN scripts are loaded)
- Check browser console for CORS errors

**"No questions generated"**
- Try a text-heavy PDF with more content
- Ensure PDF is scannable (not just images)

**History not saving?**
- Check if localStorage is enabled in your browser
- Clear browser cache and try again

---

**Made with ❤️ by Tony**