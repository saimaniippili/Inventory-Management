import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { LayoutDashboard, Package, Users, ShoppingCart, Settings, Menu, Bell, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
];

export default function Layout() {
  const { sidebarOpen, toggleSidebar } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock global search data
  const searchResults = [
    { type: 'Product', name: 'Premium Wireless Headphones', path: '/products' },
    { type: 'Product', name: 'Mechanical Keyboard', path: '/products' },
    { type: 'Customer', name: 'Alice Johnson', path: '/customers' },
    { type: 'Customer', name: 'Bob Smith', path: '/customers' },
    { type: 'Order', name: '#ORD-1001', path: '/orders' },
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="glass border-r border-border fixed h-full z-20 flex flex-col transition-all overflow-hidden"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 shadow-sm border border-zinc-200">
              <Package size={18} className="text-zinc-900" />
            </div>
            {sidebarOpen && <span className="font-semibold tracking-tight text-lg text-black font-bold">Inventry</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-secondary text-black font-bold shadow-sm border border-border' : 'text-gray-700 font-bold hover:text-black font-bold hover:bg-black/5'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon size={22} className="shrink-0" />
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
           {/* Future setting options can go here */}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Topbar */}
        <header className="h-16 glass sticky top-0 z-10 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-black/5 text-gray-700 font-bold hover:text-black font-bold transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 font-bold" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="input-glass !pl-10 h-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
              />
              
              {/* Global Search Dropdown */}
              {isSearchOpen && searchQuery && (
                <div className="absolute top-12 left-0 w-80 bg-[#1A1A27] rounded-xl p-2 z-50 flex flex-col gap-1 border border-black shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        className="flex flex-col text-left px-3 py-2 hover:bg-black/10 rounded-lg transition-colors"
                        onClick={() => {
                          navigate(result.path);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <span className="text-black font-bold text-sm font-medium">{result.name}</span>
                        <span className="text-xs text-primary">{result.type}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-700 font-bold text-center">No results found for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Empty right section to maintain flex layout if needed, or just removed */}
          <div></div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
