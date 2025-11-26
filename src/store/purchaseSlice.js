import { createSlice } from "@reduxjs/toolkit";
const initialState = [];

const purchaseSlice = createSlice({
    name: "purchases",
    initialState,
    reducers: {
        addPurchase: (state) => {
            if (!Array.isArray(state)) {
                return [
                    {
                        product_id:"",
                        cost:0,
                        qty:1,
                        retail_price:0,
                        ref:"",
                        remark:""
                    }
                ];
            }
            state.push({
                product_id:"",
                cost:0, 
                qty:1,
                retail_price:0,
                ref:"",
                remark:""
            });
        },

        updatePurchase: (state, action) => {
            const { index, field, value } = action.payload;
            if (state[index]) {
                state[index][field] = value;
            }
        },
        removePurchase: (state, action) => {
            const index = action.payload;
            if (state[index]) {
                state.splice(index, 1);
            }
        },
        resetPurchases: () => initialState,
    },
});
export const { addPurchase, updatePurchase, removePurchase, resetPurchases } = purchaseSlice.actions;
export default purchaseSlice.reducer;
