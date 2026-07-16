import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    hcpName: "",
    interactionType: "",
    specialty: "",
    hospital: "",
    date: "",
    time: "",
    attendees: "",
    topics: "",
    materialsShared: "",
    samplesDistributed: "",
    sentiment: "",
    outcomes: "",
    followUp: "",
    followUpDate: "",
};

const interactionSlice = createSlice({
    name: "interaction",
    initialState,
    reducers: {
        setField: (state, action) => {
            const { field, value } = action.payload;
            if (!(field in initialState)) {
                console.warn(`setField: "${field}" is not a valid field on interaction state`);
                return;
            }
            state[field] = value;
        },
        setMultipleFields: (state, action) => {
            Object.entries(action.payload).forEach(([key, value]) => {
                if (value !== undefined) {
                    state[key] = value;
                }
            });
        },
        resetInteraction: () => initialState,
    },
});

export const { setField, setMultipleFields, resetInteraction } = interactionSlice.actions;
export default interactionSlice.reducer;