import "./globals.css";

export const metadata = {
  title: "CodexPaycheckDashboard",
  description: "Backend-backed paycheck dashboard for remote budget edits."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
