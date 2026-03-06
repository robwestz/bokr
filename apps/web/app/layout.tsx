export const metadata = { title: "Maldives Booking" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0, padding: 24 }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <a href="/" style={{ textDecoration: "none" }}>🏝️ Maldives Booking</a>
            <a href="/admin/login">Admin</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
