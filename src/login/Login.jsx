"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";
import Logo from "../assets/logo/Kh_Mart.png";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setToken } from "@/store/authSlice";
import { request } from "@/util/request/request";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const form = useForm({
    defaultValues: { username: "", password: "" },
  });

  const [validate, setValidate] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const payload = {
      email: data.username,
      password: data.password,
    };

    const res = await request("auth/login", "POST", payload);
    if (res?.message && !res.token) {
      setValidate({ message: res.message });
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: res.message,
      });
      return;
    }
    if (res?.errors) {
      setValidate(res.errors);
      return;
    }

    // Successful login
    if (res?.token) {
      dispatch(setToken(res.token));
      Swal.fire({
        icon: "success",
        title: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => navigate("/"));
      return;
    }
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: "Invalid credentials",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white-950 via-white-800 to-white-900 overflow-hidden relative">

      {/* Animated Icons */}
      <motion.div
        className="absolute text-red-400/20"
        animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ top: "15%", left: "15%" }}
      >
        <ShoppingCart size={60} />
      </motion.div>

      <motion.div
        className="absolute text-red-500/20"
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ bottom: "20%", right: "10%" }}
      >
        <Sparkles size={50} />
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 relative rounded-2xl p-8 w-[380px] shadow-2xl overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-800"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />

        {/* Content */}
        <div className="relative z-10 text-white">
          <div className="flex flex-col items-center mb-6">
            <motion.img
              src={Logo}
              alt="Logo"
              className="w-20 h-20 rounded-full border-2 border-white shadow-md"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
            />

            <h2 className="text-2xl font-bold mt-3 tracking-wide">Welcome to KH Mart</h2>
            <p className="text-red-100 text-sm">Login to access your dashboard</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {validate.message && (
                <p className="text-white bg-red-600/40 rounded-md text-center">
                  {validate.message}
                </p>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    {validate.email && <p className="text-white">{validate.email}</p>}

                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        className="bg-white/20 text-white placeholder-red-200 border border-white/30 focus-visible:ring-white"
                      />
                    </FormControl>

                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    {validate.password && <p className="text-white">{validate.password}</p>}

                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        className="bg-white/20 text-white placeholder-red-200 border border-white/30 focus-visible:ring-white"
                      />
                    </FormControl>

                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />

              {/* BUTTON */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  type="submit"
                  className="w-full bg-white text-red-700 hover:bg-red-200 font-semibold py-2 rounded-lg transition-all duration-300"
                >
                  Login
                </Button>
              </motion.div>
            </form>

            <p className="text-center text-sm mt-4">
              If you don't have an account?{" "}
              <a href="/auth/register" className="text-red-300 hover:text-white">
                Register
              </a>
            </p>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
