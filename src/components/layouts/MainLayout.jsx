import { ScrollArea } from "@/components/ui/scroll-area";

import { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  Menu,
  X,
  User,
  Box,
  FileBox,
  Store,
  ContactRound,
  ClipboardPlus,
  ClipboardMinus,
  UserStar,
} from "lucide-react";
import { MdBrandingWatermark } from "react-icons/md";
import Logo from "../../assets/logo/Kh_Mart.png";
import UserProfile from "../../assets/logo/user.png";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSelector, useDispatch } from "react-redux";
import { clearToken } from "@/store/authSlice";
import { request } from "@/util/request/request";

function Sidebar({ isOpen, setIsOpen, isOpenDesktop, setIsOpenDesktop }) {
  const sidebarRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useSelector((state) => state?.auth?.token);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        navigate("/auth/login");
        return;
      }
      setLoading(true);
      try {
        const res = await request("auth/me", "GET", {}, token);
        setUser(res.data || res);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const navItems = [
    { to: "/", label: "Home", icon: <HomeIcon size={20} /> },
    { to: "/pos", label: "POS", icon: <Store size={20} /> },
    { to: "/product", label: "Product", icon: <Box size={20} /> },
    { to: "/brand", label: "Brand", icon: <MdBrandingWatermark size={20} /> },
    { to: "/category", label: "Category", icon: <FileBox size={20} /> },
    { to: "/supplier", label: "Supplier", icon: <ContactRound size={20} /> },
    { to: "/customer", label: "Customer", icon: <UserStar size={20} /> },
    { to: "/purchase", label: "Purchase", icon: <ContactRound size={20} /> },
    { to: "/purchase-report", label: "Purchase Report", icon: <ClipboardMinus size={20} /> },
    { to: "/order", label: "Order Report", icon: <ClipboardPlus size={20} /> },
    { to: "/user", label: "Users", icon: <User size={20} /> },
  ];

  const rolePermissions = {
    admin: ["Home", "POS", "Product", "Brand", "Category", "Supplier", "Customer", "Purchase", "Purchase Report", "Order Report", "Users"],
    manager: ["Home", "POS", "Product", "Brand", "Category", "Supplier", "Customer", "Purchase", "Purchase Report", "Order Report"],
    sale: ["Home", "POS", "Customer", "Order Report"],
  };

  const filteredNavItems = user?.role
    ? navItems.filter((item) => rolePermissions[user.role]?.includes(item.label))
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navClasses = (isActive) =>
    `flex items-center gap-3 transition-all duration-300 ${
      isActive
        ? "bg-white/90 text-red-900 p-3 text-[18px] font-semibold m-2 rounded-xl shadow-md"
        : "m-2 text-white/90 p-3 text-[18px] font-medium hover:bg-white/20 hover:text-white backdrop-blur-sm rounded-xl"
    }`;

  const sidebarVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { x: "-100%", opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <>
      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={sidebarRef}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-red-900/90 backdrop-blur-lg h-full w-[250px] fixed left-0 top-0 z-[60] shadow-2xl border-r border-red-700/40"
          >
            <div className="flex justify-between py-5 px-4 border-b border-white/20">
              <h1 className="text-white text-2xl font-bold uppercase">
                {loading ? "Loading..." : user?.role || "Role"}
              </h1>

              <motion.button
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className="text-white hover:bg-white/20 rounded-md p-1 transition cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <X />
              </motion.button>
            </div>

            {/* Scrollable navigation (mobile) */}
            <ScrollArea className="h-[calc(100vh-80px)] px-3 py-5">
              <div className="flex flex-col">
                {filteredNavItems.map((item) => (
                  <motion.div key={item.to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) => navClasses(isActive)}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon} {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <AnimatePresence>
        {isOpenDesktop && (
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-red-900/80 backdrop-blur-lg h-screen w-[250px] hidden md:flex flex-col sticky top-0 shadow-lg border-r border-white/10"
          >
            <div className="flex justify-between py-5 px-5 items-center border-b border-white/20">
              <h1 className="text-white text-2xl font-bold uppercase">
                {loading ? "Loading..." : user?.role || "Role"}
              </h1>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                className="text-white hover:bg-white/20 rounded-md p-1 transition cursor-pointer"
                onClick={() => setIsOpenDesktop(false)}
              >
                <X />
              </motion.button>
            </div>

            {/* Scrollable navigation (desktop) */}
            <ScrollArea className="h-[calc(100vh-80px)] px-4 py-5">
              <div className="flex flex-col">
                {filteredNavItems.map((item) => (
                  <motion.div key={item.to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                    <NavLink to={item.to} end className={({ isActive }) => navClasses(isActive)}>
                      {item.icon} {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDesktop, setIsOpenDesktop] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useSelector((state) => state?.auth?.token);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        navigate("/auth/login");
        return;
      }
      setLoading(true);
      try {
        const res = await request("auth/me", "GET", {}, token);
        setUser(res.data || res);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const mainVariants = {
    expanded: { transition: { duration: 0.4, ease: "easeOut" } },
    collapsed: { transition: { duration: 0.4, ease: "easeInOut" } },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isOpenDesktop={isOpenDesktop}
        setIsOpenDesktop={setIsOpenDesktop}
      />

      <motion.div
        className="flex-1 flex flex-col w-full"
        animate={isOpenDesktop ? "expanded" : "collapsed"}
        variants={mainVariants}
      >
        <header className="flex justify-between items-center w-full py-4 bg-red-900/90 backdrop-blur-lg px-4 sticky top-0 z-50 shadow-md border-b border-white/10">
          <div className="flex gap-5">
            <motion.button
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:inline-flex text-white hover:bg-white/20 hover:text-white rounded-md p-2 transition cursor-pointer"
              onClick={() => setIsOpenDesktop(!isOpenDesktop)}
            >
              <Menu />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-white hover:bg-white/20 hover:text-white rounded-md p-2 transition cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu />
            </motion.button>

            <div className="flex items-center gap-2">
              <img
                src={Logo}
                alt="Logo"
                className="h-10 w-auto object-contain rounded-[10px] border-2 border-b-amber-50"
              />
              <span className="hidden md:block text-white text-lg font-bold tracking-wide">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:bg-white/20 p-1 transition cursor-pointer">
                <img src={UserProfile} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                <span className="text-white font-medium hidden md:block">
                  {loading ? "Loading..." : user?.name || "Guest"}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48 bg-white rounded-lg shadow-lg p-2">
                <DropdownMenuLabel className="text-gray-500 text-sm">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="hover:bg-gray-100 rounded-md w-full block px-2 py-1">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/team" className="hover:bg-gray-100 rounded-md w-full block px-2 py-1">
                    Team
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(clearToken());
                  }}
                  className="hover:bg-red-100 text-red-600 rounded-md"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 w-full max-w-full p-3 md:p-6 bg-gray-100 rounded-tl-3xl shadow-inner overflow-x-auto">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}

export default MainLayout;
