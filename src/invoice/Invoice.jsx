import React, { forwardRef } from "react";

const Invoice = forwardRef(({ order }, ref) => {
  if (!order) return null;

  const formatMoney = (num) =>
    Number(num || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div
      ref={ref}
      style={{
        width: "80mm",
        padding: "10px 12px",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        fontSize: "13px",
        lineHeight: "1.4",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h2
          style={{
            margin: "0",
            fontSize: "20px",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          KH MART
        </h2>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          <span>Street 2026, Phnom Penh</span>
          <br />
          <span>Tel: 098 888 555</span>
        </div>
      </div>

      {/* Invoice Info */}
      <div style={{ marginBottom: "8px" }}>
        <p style={{ margin: "3px 0" }}>
          <b>Invoice:</b> {order.invoice_number || "N/A"}
        </p>
        <p style={{ margin: "3px 0" }}>
          <b>Date:</b>{" "}
          {order.created_at
            ? new Date(order.created_at).toLocaleString()
            : "N/A"}
        </p>
        <p style={{ margin: "3px 0" }}>
          <b>Cashier:</b> {order.user?.name || "Unknown"}
        </p>
        <p style={{ margin: "3px 0" }}>
          <b>Customer:</b> {order.customer?.name || "Walk-in Customer"}
        </p>
      </div>

      <hr style={{ borderTop: "1px dashed #999" }} />

      {/* Items Section */}
      <h4
        style={{
          marginTop: "5px",
          marginBottom: "6px",
          fontSize: "14px",
          fontWeight: "bold",
          textDecoration: "underline",
        }}
      >
        Items
      </h4>

      {(order.order_details || []).map((item) => (
        <div
          key={item.id}
          style={{
            marginBottom: "8px",
            borderBottom: "1px dashed #ddd",
            paddingBottom: "4px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "2px",
              fontSize: "13px",
            }}
          >
            {item.product_name || "Unnamed Product"}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <span>
              {item.qty || 0} × ${formatMoney(item.price)}
            </span>
            <span>${formatMoney(item.total)}</span>
          </div>

          {Number(item.discount) > 0 && (
            <div style={{ fontSize: "11px", color: "#148743" }}>
              Discount: {item.discount}%
            </div>
          )}
        </div>
      ))}

      <hr style={{ borderTop: "1px dashed #999" }} />

      {/* Totals */}
      <div style={{ marginTop: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "13px",
          }}
        >
          <b>Total:</b> <span>${formatMoney(order.total_amount)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span>Cash Received:</span>
          <span>${formatMoney(order.cash_received)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          <span>Change:</span>
          <span>${formatMoney(order.change_amount)}</span>
        </div>
        <div  style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          <span>Payment Method:</span>
          <span>{order.payment_method || "N/A"}</span>
        </div>
      </div>

      <hr style={{ borderTop: "1px dashed #999" }} />

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "12px",
          fontStyle: "italic",
        }}
      >
        Thank you for shopping at KH MART!
      </p>
      <p style={{ textAlign: "center", fontSize: "11px", marginTop: "4px" }}>
        Visit again ❤️
      </p>
    </div>
  );
});

export default Invoice;
