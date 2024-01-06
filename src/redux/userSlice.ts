import { User } from "@/lib/supabase/supabase.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState:{id:string; email:string; subscription:any} = {
    id: '',
    email: '',
    subscription:null
}
export const USERSLICEFN = createSlice({
    name: 'USERSLICE',
    initialState,
    reducers : {
        setCURRUSER : (state, curruser:PayloadAction<any>)=>{
            return {...curruser.payload}
        }
    }
})

export const initialstateScreenWidth:number = 1920;
export const SCREENWIDTH = createSlice({
    name: 'SCREENWIDTH',
    initialState: initialstateScreenWidth,
    reducers : {
        setScreenWidthRedux : (state, screenwidth:PayloadAction<number>)=>{
            return screenwidth.payload;
        }
    }
})
export const initialstateIsDrawerOpen:boolean = true;
export const ISDRAWEROPEN = createSlice({
    name: 'ISDRAWEROPEN',
    initialState: initialstateIsDrawerOpen,
    reducers : {
        setIsDrawerOpenRedux : (state, draweropen:PayloadAction<boolean>)=>{
            return draweropen.payload;
        }
    }
})

export const { setCURRUSER} = USERSLICEFN.actions;
export const USERSLICEFNReducer = USERSLICEFN.reducer;

export const {setScreenWidthRedux} = SCREENWIDTH.actions;
export const SCREENWIDTHReducer = SCREENWIDTH.reducer;

export const {setIsDrawerOpenRedux} = ISDRAWEROPEN.actions;
export const ISDRAWEROPENReducer = ISDRAWEROPEN.reducer;