import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Lock, Mail, Shield } from "lucide-react";
import Swal from "sweetalert2";
import { request } from "@/util/request/request";
import { useNavigate } from "react-router-dom";
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    try {
      const res = await request("auth/register", "POST", form, null);
      Swal.fire("Success", "User Registered Successfully!", "success").then(() => {
        navigate("/auth/login");
      });
    } catch (error) {
      Swal.fire("Error", "Registration Failed", "error");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white-950 via-white-800 to-white-900 overflow-hidden relative">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-64 h-64 bg-red-500/20 rounded-full top-10 left-10"
          animate={{ y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-red-700/30 rounded-full bottom-10 right-10"
          animate={{ y: [0, -40, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-red-900/90 backdrop-blur-md shadow-2xl p-8 rounded-2xl w-[90%] max-w-md text-white z-10"
      >
        <div className="flex justify-center mb-6">
          <UserPlus className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Full Name</label>
            <div className="flex items-center bg-red-800/70 rounded-lg px-3 py-2">
              <UserPlus className="w-5 h-5 mr-2" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-white"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Email</label>
            <div className="flex items-center bg-red-800/70 rounded-lg px-3 py-2">
              <Mail className="w-5 h-5 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-white"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Role</label>
            <div className="flex items-center bg-red-800/70 rounded-lg px-3 py-2">
              <Shield className="w-5 h-5 mr-2" />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-white"
                required
              >
                <option value="" className="text-black">Select role</option>
                <option value="admin" className="text-black">Admin</option>
                <option value="manager" className="text-black">Manager</option>
                <option value="sale" className="text-black">Sale</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Password</label>
            <div className="flex items-center bg-red-800/70 rounded-lg px-3 py-2">
              <Lock className="w-5 h-5 mr-2" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-white"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Confirm Password</label>
            <div className="flex items-center bg-red-800/70 rounded-lg px-3 py-2">
              <Lock className="w-5 h-5 mr-2" />
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-white"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-700 to-red-500 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-400 transition-all"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/auth/login" className="text-red-300 hover:text-white">
            Login here
          </a>
        </p>
      </motion.div>
    </div>
  );
}
