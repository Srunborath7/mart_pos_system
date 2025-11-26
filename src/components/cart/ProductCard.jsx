"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

function ProductCard({ item, onAdd, onOpenDetail }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="cursor-pointer"
    >
      <Card className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-900 font-bold text-base sm:text-lg md:text-xl lg:text-2xl leading-tight truncate">
            {item.name}
          </CardTitle>
          <CardDescription className="text-gray-500 text-xs sm:text-sm md:text-base truncate">
            {item.category?.name} • {item.brand?.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pt-0">
          <div className="relative w-full h-36 sm:h-44 md:h-52 lg:h-60 rounded-2xl overflow-hidden mb-4 shadow-md bg-gray-50 flex items-center justify-center">
            <motion.img
              src={item.image_url || "/no-image.png"}
              alt={item.name}
              onError={(e) => (e.currentTarget.src = "/no-image.png")}
              className="w-24 sm:w-28 md:w-32 lg:w-36 h-24 sm:h-28 md:h-32 lg:h-36 object-cover rounded-xl shadow-sm transition-transform duration-500 hover:scale-110"
            />
            {item.discount > 0 && (
              <Badge className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-xl font-semibold text-xs sm:text-sm shadow-lg">
                -{item.discount}%
              </Badge>
            )}
          </div>

          <div className="space-y-2 px-3">
            <div className="flex justify-between text-gray-600 text-xs sm:text-sm md:text-base">
              <p>
                Unit: <span className="font-semibold">{item.product_detail?.unit || "N/A"}</span>
              </p>
              <p>
                Stock: <span className="font-semibold">{item.qty}</span>
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-red-900 font-extrabold text-base sm:text-lg md:text-xl lg:text-2xl">
                ${item.price}
              </p>

              <Badge
                className={`px-2 sm:px-1 py-1 sm:py-1.5 rounded-full shadow-sm lg:text-[18px] text-md:text-base ${item.status ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                  }`}
              >
                {item.status ? "Available" : "Not Available"}
              </Badge>

            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex flex-col lg:flex-row gap-2 ">
          <button
            onClick={() => onOpenDetail(item)}
            className="flex-1 w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 sm:w-full rounded-2xl shadow-sm hover:shadow-md transition-all font-medium text-xs sm:text-sm md:text-base"
          >
            Detail
          </button>
 
          <button
            onClick={() => onAdd(item)}
            className="flex-1 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-900 text-white px-3 sm:px-4 sm:w-full py-2 sm:py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold tracking-wide text-xs sm:text-sm md:text-base"
          >
            <ShoppingCart size={18} /> Add
          </button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}

export default ProductCard;
