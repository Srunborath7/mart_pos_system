import { useDispatch, useSelector } from "react-redux";
import {
  addPurchase,
  updatePurchase,
  removePurchase,
  resetPurchases,
} from "@/store/purchaseSlice";
import { useEffect, useState } from "react";
import { request } from "@/util/request/request";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Swal from "sweetalert2";

export default function PurchasePage() {
  const dispatch = useDispatch();
  const purchases = useSelector((state) => state.purchases);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [paid, setPaid] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const supplierRes = await request("suppliers", "get");
      const productRes = await request("products", "get");
      setSuppliers(supplierRes?.data || []);
      setProducts(productRes?.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load supplier or product data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRow = () => {
    dispatch(addPurchase());
  };

  const handleChange = (index, field, value) => {
    dispatch(updatePurchase({ index, field, value }));
  };
  const handleRemove = (index) => {
    dispatch(removePurchase(index));
  };
  const total = purchases.reduce(
    (sum, item) => sum + (item.cost * item.qty || 0),
    0
  );


  const handleSavePurchase = async () => {
    if (!supplierId) {
      Swal.fire("Missing Supplier", "Please select a supplier.", "warning");
      return;
    }
    if (purchases.length === 0) {
      Swal.fire("Empty List", "Please add at least one product.", "warning");
      return;
    }
    if (!paidDate) {
      Swal.fire("Missing Date", "Please select a paid date.", "warning");
      return;
    }

    const payload = {
      supplier_id: supplierId,
      shipping_cost: parseFloat(shippingCost) || 0,
      paid: parseFloat(paid) || 0,
      paid_date: paidDate,
      products: purchases.map((p) => ({
        product_id: p.product_id,
        cost: p.cost,
        qty: p.qty,
        retail_price: p.retail_price,
        ref: p.ref || "",
        remark: p.remark || "",
      })),
    };

    try {
      setLoading(true);
      const res = await request("purchases", "post", payload);

      if (!res.error) {
  Swal.fire("Success", "Purchase saved successfully!", "success");
  dispatch(resetPurchases());
  setSupplierId("");
  setShippingCost("");
  setPaid("");
  setPaidDate("");
      } else {
  Swal.fire("Error", res.errors || "Failed to save purchase.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save purchase.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Cancel Purchase?",
      text: "All unsaved data will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(resetPurchases());
        setSupplierId("");
        setShippingCost("");
        setPaid("");
        setPaidDate("");
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
    <h2 className="text-2xl md:text-3xl font-extrabold mb-6 
                  text-red-900 tracking-tight">
      Create Purchase
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow border border-red-900/20">
        <label className="block mb-2 font-semibold text-red-900">Supplier</label>
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="w-full p-2 rounded-xl border border-red-900/30 focus:ring-2 focus:ring-red-900"
        >
          <option value="">Select supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow border border-red-900/20">
        <label className="block mb-2 font-semibold text-red-900">Shipping Cost ($)</label>
        <input
          type="number"
          value={shippingCost}
          onChange={(e) => setShippingCost(e.target.value)}
          className="w-full p-2 rounded-xl border border-red-900/30 focus:ring-2 focus:ring-red-900"
          placeholder="0.00"
        />
      </div>
      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow border border-red-900/20">
        <label className="block mb-2 font-semibold text-red-900">Paid ($)</label>
        <input
          type="number"
          value={paid}
          onChange={(e) => setPaid(e.target.value)}
          className="w-full p-2 rounded-xl border border-red-900/30 focus:ring-2 focus:ring-red-900"
          placeholder="0.00"
        />
      </div>
      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow border border-red-900/20">
        <label className="block mb-2 font-semibold text-red-900">Paid Date</label>
        <input
          type="date"
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
          className="w-full p-2 rounded-xl border border-red-900/30 focus:ring-2 focus:ring-red-900"
        />
      </div>
    </div>
    <div className="overflow-x-auto shadow-lg rounded-2xl border border-red-900/30 mb-6 bg-white/60 backdrop-blur">
      <table className="w-full border-collapse">
        <thead className="bg-red-900 text-white text-sm">
          <tr>
            <th className="p-3 border border-red-900/40">Product</th>
            <th className="p-3 border border-red-900/40">Qty</th>
            <th className="p-3 border border-red-900/40">Cost</th>
            <th className="p-3 border border-red-900/40">Retail</th>
            <th className="p-3 border border-red-900/40">Ref</th>
            <th className="p-3 border border-red-900/40">Remark</th>
            <th className="p-3 border border-red-900/40 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {purchases.map((item, index) => (
            <tr key={index} className="border-t border-red-900/20 bg-white/70">
              <td className="p-3 border border-red-900/20">
                <select
                  value={item.product_id || ""}
                  onChange={(e) => handleChange(index, "product_id", e.target.value)}
                  className="w-full p-2 rounded-lg border border-red-900/40"
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </td>

              <td className="p-3 border border-red-900/20">
                <input
                  type="number"
                  value={item.qty || ""}
                  onChange={(e) => handleChange(index, "qty", parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-red-900/40"
                />
              </td>

              <td className="p-3 border border-red-900/20">
                <input
                  type="number"
                  value={item.cost || ""}
                  onChange={(e) => handleChange(index, "cost", parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-red-900/40"
                />
              </td>

              <td className="p-3 border border-red-900/20">
                <input
                  type="number"
                  value={item.retail_price || ""}
                  onChange={(e) => handleChange(index, "retail_price", parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-red-900/40"
                />
              </td>

              <td className="p-3 border border-red-900/20">
                <input
                  value={item.ref || ""}
                  onChange={(e) => handleChange(index, "ref", e.target.value)}
                  className="w-full p-2 rounded-lg border border-red-900/40"
                />
              </td>

              <td className="p-3 border border-red-900/20">
                <input
                  value={item.remark || ""}
                  onChange={(e) => handleChange(index, "remark", e.target.value)}
                  className="w-full p-2 rounded-lg border border-red-900/40"
                />
              </td>

              <td className="p-3 border border-red-900/20 text-center">
                <Button
                  variant="destructive"
                  className="rounded-full bg-red-900 text-white hover:bg-red-700"
                  onClick={() => handleRemove(index)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <Button
        onClick={handleAddRow}
        className="bg-red-900 text-white hover:bg-red-700 rounded-full px-6 py-2"
      >
        + Add Product
      </Button>

      <h3 className="text-xl font-bold text-red-900">
        Total: ${total.toLocaleString()}
      </h3>
    </div>
    <div className="flex gap-4">
      <Button 
        variant="secondary" 
        onClick={handleCancel}
        className="rounded-full border border-red-900/40 text-red-900 hover:bg-red-50"
      >
        Cancel
      </Button>

      <Button
        onClick={handleSavePurchase}
        disabled={loading}
        className="rounded-full bg-red-900 text-white px-6 py-2 hover:bg-red-700"
      >
        {loading ? "Saving..." : "Save Purchase"}
      </Button>
    </div>

  </div>

  );
}
