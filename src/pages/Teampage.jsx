"use client";

import { motion } from "framer-motion";
import Profile from "@/assets/logo/logo.jpg";

export default function TeamPage() {
  return (
    <div className="h-[88vh] bg-gradient-to-br from-white-900 via-gray-1s00 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row gap-10"
      >
        {/* LEFT SIDE – PROFILE */}
        <div className="flex flex-col items-center md:w-1/3">
          <motion.img
            src={Profile}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-full border-4 border-black shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          />

          <h2 className="text-black text-2xl font-semibold mt-6 tracking-wide">
            Srun Borath
          </h2>
          <p className="text-black text-sm mt-2 text-center">
            • Full Stack Developer • Mobile Developer <br/>• Python
          </p>

          <div className="flex gap-4 mt-5">
            <button className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600 text-black rounded-full shadow-lg transition-all">
              Contact
            </button>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-black rounded-full shadow-lg transition-all">
              Portfolio
            </button>
          </div>
        </div>

        <div className="md:w-2/3 space-y-6">
          <h3 className="text-black text-3xl font-bold">About My Project</h3>

          <p className="text-black leading-relaxed">
            I’m building a full modern POS system for mart in Cambodia, including:
            inventory tracking, user roles, payment workflow, invoice PDF, and
            dashboard with real-time analytics using Laravel, React,
            TailwindCSS, MongdoDB.
          </p>

          <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
            <h4 className="text-lg text-black font-semibold mb-3">
               Project Highlights:
            </h4>
            <ul className="text-black space-y-2">
              <li>✔ POS with product, category, stock management</li>
              <li>✔ Payment confirmation using SweetAlert2</li>
              <li>✔ PDF invoice generation</li>
              <li>✔ authentication + role management</li>
              <li>✔ Dashboard: purchase, sales, monthly charts</li>
              <li>✔ Clean UI using Tailwind + React + Framer Motion</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
