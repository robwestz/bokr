import "./globals.css";

export const metadata = { title: "Bokr — Resort Table Booking", description: "Book tables at Maldives resort restaurants" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <a href="/" className="logo">Bokr</a>
            <nav>
              <a href="/admin/login">Admin</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
