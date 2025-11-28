"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Card } from "@/components/ui/card";
import { request } from "@/util/request/request";
import ProductCard from "@/components/cart/ProductCard";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/assets/logo/Kh_Mart.png";
import { setRefresh } from "@/store/refreshSlice";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decrementCart, clearAll, clearItemCart } from "@/store/cartSlice";

import Invoice from "@/invoice/Invoice";
import { Trash2 } from "lucide-react";

function PosPage() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const refresh = useSelector((state) => state.refresh.value);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("Walk-in-Customer");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = ["all", ...new Set(products.map((p) => p.category?.name).filter(Boolean))];

  // Filtered products
  const filteredProducts = products.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category?.name === selectedCategory;
    return matchesName && matchesCategory;
  });
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchData();
      dispatch(setRefresh(false));
    }
  }, [refresh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resProducts = await request("products", "get");
      const resCustomers = await request("customers", "get");
      if (resProducts?.data) setProducts(resProducts.data);
      if (resCustomers?.data) setCustomers(resCustomers.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => dispatch(addToCart(item));
  const handleDecrement = (item) => dispatch(decrementCart(item));
  const handleRemoveItem = (item) => dispatch(clearItemCart(item));
  const handleClearCart = () => dispatch(clearAll());
  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const totalOriginal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const totalDiscount = cart.reduce(
    (sum, item) => sum + (Number(item.discount || 0) / 100) * Number(item.price) * Number(item.qty),
    0
  );
  const total = Number((totalOriginal - totalDiscount).toFixed(2));

  const handlePay = async () => {
    if (!cart.length) return Swal.fire("Cart is empty!", "", "warning");

    let cashReceived = 0;
    let changeAmount = 0;

    if (paymentMethod === "Cash") {
      const { value: amount } = await Swal.fire({
        title: "Enter Cash Received",
        input: "number",
        inputLabel: `Total to Pay: $${total.toFixed(2)}`,
        inputAttributes: { min: total, step: "0.01" },
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        inputValidator: (value) =>
          !value || Number(value) < total ? "Cash must be equal to or greater than total!" : null,
      });

      if (!amount) return;
      cashReceived = Number(amount);
      changeAmount = cashReceived - total;
    }

    const orderData = {
      paid_amount: total.toFixed(2),
      total_amount: total.toFixed(2),
      payment_method: paymentMethod,
      customer_id: selectedCustomer || null,
      cash_received: paymentMethod === "Cash" ? cashReceived.toFixed(2) : "0",
      change_amount: paymentMethod === "Cash" ? changeAmount.toFixed(2) : "0",
      detail: cart.map((item) => ({
        price: Number(item.price),
        qty: item.qty,
        discount: item.discount || 0,
        total:
          Number(item.price) * Number(item.qty) - ((Number(item.discount) || 0) / 100) * Number(item.price) * Number(item.qty),
        product_id: item.id,
      })),
    };

    try {
      const res = await request("orders", "post", orderData);
      if (res?.data) {
        const returnedOrder = res.data.order || res.data;
        const returnedPdf = res.data.invoice_pdf || res.data.invoice_pdf_url || null;

        setInvoiceOrder(returnedOrder);
        setInvoiceUrl(returnedPdf);
        setIsInvoiceModalOpen(true);

        Swal.fire({
          icon: "success",
          title: "Payment Completed!",
          html: `
            <div style="font-size:16px; text-align:left;">
              <p><b>Total:</b> $${total.toFixed(2)}</p>
              <p><b>Cash Received:</b> $${paymentMethod === "Cash" ? cashReceived.toFixed(2) : "0"}</p>
              <p><b>Change:</b> $${paymentMethod === "Cash" ? changeAmount.toFixed(2) : "0"}</p>
            </div>
          `,
          confirmButtonText: "OK",
        });

        handleClearCart();
        dispatch(setRefresh(true));
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Payment failed!", "error");
    }
  };

  const handlePrintInvoice = () => {
    if (!invoiceOrder) return Swal.fire("Nothing to print", "", "warning");

    const invoiceContent = document.getElementById("invoice-to-print")?.innerHTML;
    if (!invoiceContent) return Swal.fire("Invoice not available", "", "warning");

    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${invoiceOrder.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
        </style>
      </head>
      <body>
        ${invoiceContent}
      </body>
    </html>
  `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 100);
  };


  const openOriginalPdf = () => {
    if (!invoiceUrl) return Swal.fire("No PDF", "Invoice PDF URL not available", "info");
    window.open(invoiceUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-md bg-white/70 p-4 rounded-2xl shadow-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-red-900 tracking-wide">POS System</h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">Fast • Clean • Modern Interface</p>
        </div>
        <img src={Logo} alt="POS Logo" className="w-8 md:w-12 lg:w-16 drop-shadow-md" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 bg-white/80 p-4 rounded-2xl shadow-xl flex flex-col gap-3"
        >
          <h2 className="text-xl font-semibold mb-3 text-red-900">Shopping</h2>
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Button variant="outline" disabled>
                <Spinner /> Loading...
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] rounded-xl p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
                {filteredProducts.map((item) => (
                  <ProductCard key={item.id} item={item} onAdd={handleAddToCart} onOpenDetail={handleOpenDetail} />
                ))}
              </div>
            </ScrollArea>
          )}
        </motion.div>

        {/* Cart */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 p-4 rounded-2xl shadow-xl flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold mb-3 text-red-900">Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center">Cart is empty</p>
          ) : (
            <>
              <ScrollArea className=" h-[30vh] rounded-xl p-2">
                <div className="space-y-2">
                  {cart.map((item) => {
                    const itemTotal =
                      Number(item.price) * item.qty -
                      ((item.discount || 0) / 100) * Number(item.price) * item.qty;
                    return (
                      <Card
                        key={item.id}
                        className="p-3 flex flex-col lg:flex-row justify-between items-start md:items-center bg-white/70 border shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col items-center gap-3 mb-3 md:mb-0 lg:flex-row">
                          <img
                            src={item.image_url || "/no-image.png"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border sm:mx-auto"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              ${Number(item.price).toFixed(2)} x {item.qty}
                            </p>
                            {item.discount > 0 && (
                              <p className="text-xs text-green-600">
                                Discount: {item.discount}% → $
                                {(item.discount / 100 * item.price * item.qty).toFixed(2)}
                              </p>
                            )}
                            <p className="text-sm font-semibold">Total: ${itemTotal.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button size="sm" variant="outline" onClick={() => handleDecrement(item)}>
                            -
                          </Button>
                          <span className="px-2">{item.qty}</span>
                          <Button size="sm" variant="outline" onClick={() => handleAddToCart(item)}>
                            +
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveItem(item)}>
                            <Trash2 />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* totals */}
              <div className="flex flex-col lg:flex-row gap-4 mt-2">
                <Card className="flex-1 p-4 bg-red-50 rounded-lg font-semibold flex flex-col items-center">
                  <span className="text-sm text-gray-500">Original Total</span>
                  <span className="text-lg font-bold text-red-600">${totalOriginal.toFixed(2)}</span>
                </Card>
                <Card className="flex-1 p-4 bg-green-50 rounded-lg font-semibold flex flex-col items-center">
                  <span className="text-sm text-gray-500">Discount</span>
                  <span className="text-lg font-bold text-green-600">-${totalDiscount.toFixed(2)}</span>
                </Card>
                <Card className="flex-1 p-4 bg-blue-50 rounded-lg font-bold flex flex-col items-center">
                  <span className="text-sm text-gray-500">Grand Total</span>
                  <span className="text-xl font-extrabold text-blue-600">${total.toFixed(2)}</span>
                </Card>
              </div>

              {/* customer & payment */}
              <div className="flex flex-col gap-3 mt-2">
                <Card className="p-3">
                  <label className="block mb-1 font-medium">Select Customer</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="Walk-in-Customer">Walk-in-Customer</option>
                    {customers?.map((cus) => (
                      <option key={cus.id} value={cus.id}>
                        {cus.name}
                      </option>
                    ))}
                  </select>
                </Card>

                <Card className="p-3">
                  <label className="block mb-1 font-medium">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="ABA">ABA</option>
                    <option value="AC">AC</option>
                    <option value="Wing">Wing</option>
                    <option value="Cash">Cash</option>
                  </select>
                </Card>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Button variant="destructive" onClick={handleClearCart}>
                  Clear Cart
                </Button>
                <Button
                  variant="primary"
                  className="bg-green-900 hover:bg-green-800 text-white"
                  onClick={handlePay}
                >
                  Pay
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent data-vaul-drawer-direction="top" className="w-[90%] md:w-[60%] lg:w-[50%] mx-auto p-4 border shadow-xl bg-white rounded-xl">
          <DrawerHeader className="border-b pb-2">
            <DrawerTitle className="text-2xl font-bold">{selectedItem?.name}</DrawerTitle>
            <DrawerDescription className="text-sm text-gray-500">{selectedItem?.category?.name}</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            <div className="flex justify-center md:w-1/2 items-center">
              <img
                src={selectedItem?.image_url || "/no-image.png"}
                className="w-full max-w-[250px] h-64 object-cover rounded-xl shadow-md"
                alt={selectedItem?.name}
              />
            </div>
            <div className="flex-1 space-y-3">
              <p>
                <b>Price:</b> ${selectedItem?.price}
              </p>
              <p>
                <b>Stock:</b> {selectedItem?.qty}
              </p>
              <p>
                <b>Unit:</b> {selectedItem?.product_detail?.unit || "N/A"}
              </p>
              <p>
                <b>Brand:</b> {selectedItem?.brand?.name || "N/A"}
              </p>
              {selectedItem?.discount > 0 && (
                <p className="text-green-600 font-semibold">Discount: {selectedItem.discount}%</p>
              )}
              <p>
                <b>Barcode:</b> {selectedItem?.product_detail?.barcode || "N/A"}
              </p>
              <p>
                <b>SKU:</b> {selectedItem?.product_detail?.sku || "N/A"}
              </p>
              <p>
                <b>Made in:</b> {selectedItem?.product_detail?.made_in || "N/A"}
              </p>
              <p>
                <b>Expiry Date:</b> {selectedItem?.product_detail?.exp_date || "N/A"}
              </p>
            </div>
          </div>
          <DrawerFooter className="mt-4 border-t pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Invoice Modal */}
      {isInvoiceModalOpen && invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[92%] md:w-[780px] h-[85%] rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Invoice Preview — {invoiceOrder.invoice_number}</h3>
              <div className="flex gap-2">
                <Button onClick={openOriginalPdf}>Open Original PDF</Button>
                <Button onClick={handlePrintInvoice} className="bg-green-700 text-white">
                  Print
                </Button>
                <Button variant="destructive" onClick={() => setIsInvoiceModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 justify-center items-center flex">
              <div id="invoice-to-print" className="border border-gray-300 bg-white p-4">
                <Invoice order={invoiceOrder} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosPage;
