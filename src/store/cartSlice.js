import { createSlice } from "@reduxjs/toolkit";

const initialState = JSON.parse(localStorage.getItem("cart")) || [];

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existing = state.find((i) => i.id === item.id);
            if (existing) {
                existing.qty += 1;
            } else {
                state.push({ ...item, qty: 1, discount: item.discount || 0 });
            }
            localStorage.setItem("cart", JSON.stringify(state));
        },

        decrementCart: (state, action) => {
            const item = action.payload;
            const existing = state.find((i) => i.id === item.id);
            if (existing) {
                if (existing.qty > 1) {
                    existing.qty -= 1;
                } else {
                    const index = state.findIndex((i) => i.id === item.id);
                    state.splice(index, 1);
                }
            }
            localStorage.setItem("cart", JSON.stringify(state));
        },

        clearItemCart: (state, action) => {
            const item = action.payload;
            const updated = state.filter((i) => i.id !== item.id);
            localStorage.setItem("cart", JSON.stringify(updated));
            return updated;
        },

        clearAll: () => {
            localStorage.removeItem("cart");
            return [];
        },

        // Update quantity manually
        updateQty: (state, action) => {
            const { id, qty } = action.payload;
            const item = state.find((i) => i.id === id);
            if (item) item.qty = qty;
            localStorage.setItem("cart", JSON.stringify(state));
        },

        // Update discount manually
        updateDiscount: (state, action) => {
            const { id, discount } = action.payload;
            const item = state.find((i) => i.id === id);
            if (item) item.discount = discount;
            localStorage.setItem("cart", JSON.stringify(state));
        },
    },
});

export const {
    addToCart,
    decrementCart,
    clearItemCart,
    clearAll,
    updateQty,
    updateDiscount,
} = cartSlice.actions;
export default cartSlice.reducer;
