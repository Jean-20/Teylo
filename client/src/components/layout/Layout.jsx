import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white-paper">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
