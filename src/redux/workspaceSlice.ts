import { workspace } from "@/lib/supabase/supabase.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let initialState:workspace = {
    id: '',
    data: null,
    createdAt: null,
    workspaceOwner: '',
    title: '',
    iconId: '',
    inTrash: null,
    logo: null,
    bannerUrl: null,
}

export const CURRworkspaceFN = createSlice({
    name:'CURRworkspaceFN',
    initialState: initialState,
    reducers:{
        setCurrWorkspace : (state, CurrWorkspace: PayloadAction<workspace>)=>{
            return {
                ...CurrWorkspace.payload
            }
        }
    }
})


export const {setCurrWorkspace} = CURRworkspaceFN.actions;
export default CURRworkspaceFN.reducer;