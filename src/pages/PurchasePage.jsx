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

  // ✅ Load suppliers and products
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

  // ✅ Add new row
  const handleAddRow = () => {
    dispatch(addPurchase());
  };

  // ✅ Update a single field
  const handleChange = (index, field, value) => {
    dispatch(updatePurchase({ index, field, value }));
  };

  // ✅ Remove a row
  const handleRemove = (index) => {
    dispatch(removePurchase(index));
  };

  // ✅ Calculate total
  const total = purchases.reduce(
    (sum, item) => sum + (item.cost * item.qty || 0),
    0
  );

  // ✅ Save purchase to backend (compatible with your Laravel controller)
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

  // ✅ Cancel all unsaved changes
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
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create Purchase</h2>

      {/* --- Header Section --- */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block mb-1 font-medium">Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Shipping Cost ($)</label>
          <input
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Paid ($)</label>
          <input
            type="number"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Paid Date</label>
          <input
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
      </div>

      {/* --- Purchase Table --- */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Cost</th>
              <th className="p-2 border">Retail Price</th>
              <th className="p-2 border">Ref</th>
              <th className="p-2 border">Remark</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-2 border">
                  <select
                    value={item.product_id || ""}
                    onChange={(e) =>
                      handleChange(index, "product_id", e.target.value)
                    }
                    className="border rounded p-1 w-full"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded p-1 w-full"
                    value={item.qty || ""}
                    onChange={(e) =>
                      handleChange(index, "qty", parseFloat(e.target.value) || 0)
                    }
                  />
                </td>

                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded p-1 w-full"
                    value={item.cost || ""}
                    onChange={(e) =>
                      handleChange(index, "cost", parseFloat(e.target.value) || 0)
                    }
                  />
                </td>

                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded p-1 w-full"
                    value={item.retail_price || ""}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "retail_price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </td>

                <td className="p-2 border">
                  <input
                    className="border rounded p-1 w-full"
                    value={item.ref || ""}
                    onChange={(e) => handleChange(index, "ref", e.target.value)}
                  />
                </td>

                <td className="p-2 border">
                  <input
                    className="border rounded p-1 w-full"
                    value={item.remark || ""}
                    onChange={(e) =>
                      handleChange(index, "remark", e.target.value)
                    }
                  />
                </td>

                <td className="p-2 border text-center">
                  <Button
                    variant="destructive"
                    size="sm"
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

      {/* --- Add + Total --- */}
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleAddRow}>+ Add Product</Button>
        <h3 className="text-lg font-semibold">
          Total: ${total.toLocaleString()}
        </h3>
      </div>

      {/* --- Footer Buttons --- */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSavePurchase} disabled={loading}>
          {loading ? "Saving..." : "Save Purchase"}
        </Button>
      </div>
    </div>
  );
}
