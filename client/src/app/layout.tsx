import ChatBox from '../components/chatbox';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';

  return (
    <html lang="en">
      <body>
        {children}
        {/* Position the chat box in the bottom right corner */}
        <div className="fixed bottom-4 right-4 z-50">
          <ChatBox spoonacularApiKey={SPOONACULAR_API_KEY} />
        </div>
      </body>
    </html>
  );
}