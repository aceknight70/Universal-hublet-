import fs from 'fs';
let content = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');

const oldButton = `function FloatingBackButton() {
  const goBack = () => {
    window.parent.postMessage('backToParent', '*');
    window.parent.postMessage({ type: 'RETURN_TO_PARENT' }, '*');
    window.parent.postMessage('close', '*');
  };

  return (
    <button 
      onClick={goBack}
      className="fixed bottom-6 right-6 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg backdrop-blur-sm transition-all flex items-center justify-center group"
      aria-label="Go Back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}`;

const newButton = `function FloatingBackButton() {
  const navigate = useNavigate();
  const { storeSlug } = useParams<{ storeSlug: string }>();

  const goBack = () => {
    if (window.self !== window.top) {
      window.parent.postMessage('backToParent', '*');
      window.parent.postMessage({ type: 'RETURN_TO_PARENT' }, '*');
      window.parent.postMessage('close', '*');
    } else {
      navigate(\`/\${storeSlug}/master\`);
    }
  };

  return (
    <button 
      onClick={goBack}
      className="fixed bottom-6 right-6 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg backdrop-blur-sm transition-all flex items-center justify-center group"
      aria-label="Go Back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}`;

content = content.replace(oldButton, newButton);

const oldRender = `{viewMode === 'customer' && <FloatingBackButton />}`;
const newRender = `{<FloatingBackButton />}`;
content = content.replace(oldRender, newRender);

fs.writeFileSync('src/pages/StoreRouter.tsx', content);
