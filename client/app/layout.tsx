// app/layout.tsx
import React from 'react';
import ChatBox from '../src/components/chatbox';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const SPOONACULAR_API_KEY = 'your-key-here';

  return (
    <html lang="en">
      <body>
        {children}
        <div className="fixed bottom-4 right-4 z-50">
          <ChatBox spoonacularApiKey={SPOONACULAR_API_KEY} />
        </div>
      </body>
    </html>
  );
}