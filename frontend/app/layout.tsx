import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AI Study Buddy — Your Personal AI Study Coach",
  description:
    "Learn faster, revise smarter, score higher. AI-powered study planner, tutor, quizzes, flashcards and exam prep.",
  keywords: [
    "AI tutor",
    "exam prep",
    "study planner",
    "AI flashcards",
    "AI quizzes",
    "edtech",
    "personalized learning",
  ],
  openGraph: {
    title: "AI Study Buddy",
    description: "Your Personal AI Study Coach",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="relative">{children}</div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(20, 18, 36, 0.92)",
              color: "#fff",
              border: "1px solid rgba(139,92,246,0.25)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
