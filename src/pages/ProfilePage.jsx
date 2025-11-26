"use client";

import { useEffect, useState } from "react";
import { request } from "@/util/request/request";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { formatDate } from "@/util/helper/formatDate";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await request("auth/me", "GET");
      if (res && res.data) {
        setUser(res.data);
        setForm({
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      Swal.fire("Error", "Failed to fetch profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const res = await request("auth/me", "PUT", {
        name: form.name,
        email: form.email,
      });

      if (res && res.data) {
        setUser(res.data);
        Swal.fire("Success", "Profile updated successfully", "success");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      Swal.fire("Error", "Failed to update profile", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );

  return (
  <div className="flex justify-center items-center h-[87vh] bg-gray-100">
    <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">Profile</h1>

      <form className="space-y-4" onSubmit={handleUpdate}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <Input value={form.role} disabled />
        </div>

        <Button type="submit" disabled={updateLoading} className="w-full">
          {updateLoading ? (
            <Loader2 className="animate-spin w-5 h-5 mx-auto" />
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>

      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>Created at: {formatDate(user.created_at)}</p>
        <p>Updated at: {formatDate(user.updated_at)}</p>
      </div>
    </div>
  </div>
);

}
