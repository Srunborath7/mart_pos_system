import PurchaseChart from "@/components/chart/PurchaseChart";
import PurchaseProductChart from "@/components/chart/PurchaseProductChart";
import SaleChart from "@/components/chart/SaleChart";
import SaleThisMonthChart from "@/components/chart/SaleThisMonthChart";
import { request } from "@/util/request/request";
import { useEffect, useState } from "react";
import { FiShoppingCart, FiDollarSign, FiTrendingUp, FiPackage } from "react-icons/fi";

export default function HomePage() {
  const [purchaseProduct, setPurchaseProduct] = useState([]);
  const [sale, setSale] = useState([]);
  const [purchase, setPurchase] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchingData = async () => {
    setLoading(true);
    try {
      const res = await request("purchases", "get");
      const saleRes = await request("orders/getsale", "get");
      const purchaseRes = await request("purchases/summary_purchase", "get");

      if (res) setPurchaseProduct(res.data || []);
      if (saleRes) setSale(saleRes || []);
      if (purchaseRes) setPurchase(purchaseRes || []);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchingData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-xl font-semibold text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // --- Compute totals ---
  const totalSales = Array.isArray(sale?.total_sale_this_Month)
    ? sale.total_sale_this_Month.reduce((sum, item) => sum + (item.total || 0), 0)
    : sale?.total_sale_this_Month?.total || 0;

  const totalOrders = Array.isArray(sale?.total_sale_this_Month)
    ? sale.total_sale_this_Month.reduce((sum, item) => sum + (item.total_order || 0), 0)
    : sale?.total_sale_this_Month?.total_order || 0;

  const totalPurchases = Array.isArray(purchase?.summary_purchase_by_month)
    ? purchase.summary_purchase_by_month.reduce((sum, item) => sum + (item.total || 0), 0)
    : purchase?.summary_purchase_by_month?.total || 0;
  const mostPurchasedProduct =
    purchaseProduct?.length > 0
      ? purchaseProduct
        .sort((a, b) => {
          const totalA = a.product_purchases?.reduce((sum, p) => sum + (p.qty || 0), 0) || 0;
          const totalB = b.product_purchases?.reduce((sum, p) => sum + (p.qty || 0), 0) || 0;
          return totalB - totalA;
        })[0]?.product_purchases?.[0]?.product?.name || "-"
      : "-";

  const totalSaleToday = sale?.total_sale_today?.total || 0;
  const totalOrderToday = sale?.total_sale_today?.total_order || 0;

  return (
    <div className="p-6 space-y-8">
      <h1 className="lg:text-4xl sm:text-3xl font-extrabold text-gray-800 mb-6">Kh Mart Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center justify-between bg-red-50 rounded-xl shadow-lg p-6">
          <div>
            <p className="text-sm font-medium uppercase opacity-80 text-red-700">Total Sale This Month</p>
            <p className="text-3xl font-bold mt-2 text-red-900/80">${Number(totalSales).toFixed(2)}</p>
          </div>
          <FiDollarSign className="w-12 h-12 text-red-700 opacity-80" />
        </div>
        <div className="flex items-center justify-between bg-red-50 rounded-xl shadow-lg p-6">
          <div>
            <p className="text-sm font-medium uppercase opacity-80 text-red-700">Total Purchases This Month</p>
            <p className="text-3xl font-bold mt-2 text-red-900/80">${Number(totalPurchases).toFixed(2)}</p>
          </div>
          <FiShoppingCart className="w-12 h-12 text-red-700 opacity-80" />
        </div>
        <div className="flex items-center justify-between bg-red-50 rounded-xl shadow-lg p-6">
          <div>
            <p className="text-sm font-medium uppercase opacity-80 text-red-700">Total Orders</p>
            <p className="text-3xl font-bold mt-2 text-red-900/80">{Number(totalOrders)}</p>
          </div>
          <FiTrendingUp className="w-12 h-12 text-red-700 opacity-80" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-xl shadow-md p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-medium">Total Sale Today</p>
            <p className="text-2xl font-bold mt-1 text-red-900/80">${Number(totalSaleToday).toFixed(2)}</p>
          </div>
          <FiDollarSign className="w-8 h-8 text-red-700 opacity-80" />
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-medium">Total Order Today</p>
            <p className="text-2xl font-bold mt-1 text-red-900/80">{Number(totalOrderToday)}</p>
          </div>
          <FiShoppingCart className="w-8 h-8 text-red-700 opacity-80" />
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-medium">Most Purchased Product</p>
            <p className="text-2xl font-bold mt-1 text-red-900/80">{mostPurchasedProduct}</p>
          </div>
          <FiPackage className="w-8 h-8 text-red-700 opacity-80" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-red-900">Purchase Product</h2>
          <PurchaseProductChart data={purchaseProduct} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-red-900">Sale Summary this Month</h2>
          <SaleChart data={sale?.summary_sale_by_month} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-red-900">Purchase this Month</h2>
          <PurchaseChart data={purchase?.summary_purchase_by_month} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-red-900">Sale This Month</h2>
          <SaleThisMonthChart data={sale?.total_sale_this_Month} />
        </div>
      </div>
    </div>
  );
}
