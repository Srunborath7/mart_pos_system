import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false, 
};

const refreshSlice = createSlice({
  name: "refresh",
  initialState,
  reducers: {
    setRefresh: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setRefresh } = refreshSlice.actions;
export default refreshSlice.reducer;
