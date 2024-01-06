import { File, FileShared, Folder } from "@/lib/supabase/supabase.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let inTrash:boolean = false;
export const IN_TRASH_FN = createSlice({
    name: 'IN_TRASH_FN',
    initialState: inTrash,
    reducers: {
        setInTrashStateReducer : (state, inTrash: PayloadAction<boolean>)=>{
            return inTrash.payload
        }
    }
})

let initialState:Folder[] = []
export const ALLfoldersFN = createSlice({
    name:'ALLfoldersFN',
    initialState,
    reducers:{
        setAllFoldersReducer : (state, AllFolders: PayloadAction<Folder[]>)=>{
            return [...AllFolders?.payload]
        }
    }
})


let initialStateFile: any|null = {};
export const ALLfilesFN = createSlice({
    name:'ALLfilesFN',
    initialState:initialStateFile,
    reducers:{
        setAllFilesReducer : (state, AllFiles: PayloadAction<any|null>)=>{
            return JSON.parse(JSON.stringify(AllFiles.payload)) 
        }
    }
})

let initialStateIsLoading:boolean = false;
export const ISloadingFN = createSlice({
    name:'ISloadingFN',
    initialState: initialStateIsLoading,
    reducers:{
        setIsLoadingReducer : (state, isLoading: PayloadAction<boolean>)=>{
            return isLoading.payload
        }
    }
})

let initialStateSharedUserOnFile:any = {}
export const sharedUserOnFile = createSlice({
    name:'sharedUserOnFile',
    initialState: initialStateSharedUserOnFile,
    reducers: {
        setSharedUserOnFileReducer: (state, userOnFile: PayloadAction<any>)=>{
            return JSON.parse(JSON.stringify(userOnFile.payload))
        }
    }
})


// sharedfiles
let iSharedFiles:any = null
export const sharedFiles = createSlice({
    name: 'sharedFiles',
    initialState: iSharedFiles,
    reducers: {
        setAllSharedFiles: (state, allFiles: PayloadAction<any>)=>{
            return [...allFiles.payload]
        }
    }
})

let allDeletedFiles:File[] = []
export const deletedFiles = createSlice({
    name:'deletedFiles',
    initialState: allDeletedFiles,
    reducers: {
        setAllDeletedFiles : (state, allDelFiles:PayloadAction<File[]>)=>{
            return [...allDelFiles.payload]
        }
    }
})

// let currFolderInitialState:Folder = {
//     id: '',
//     data: null,
//     createdAt: null,
//     title: '',
//     iconId: '',
//     inTrash: null,
//     bannerUrl: null,
//     workspaceId: null,
// };

// export const CURRfolderFN = createSlice({
//     name:'CURRfolderFN',
//     initialState: currFolderInitialState,
//     reducers:{
//         setCurrFolderReducer: (state, CurrFolders: PayloadAction<Folder>)=>{
//             return CurrFolders.payload
//         }
//     }
// })


export const {setAllFoldersReducer } = ALLfoldersFN.actions;
// export const {setCurrFolderReducer } = CURRfolderFN.actions;
export const ALLfoldersFNReducer = ALLfoldersFN.reducer;

export const {setInTrashStateReducer} = IN_TRASH_FN.actions;
export const IN_TRASH_FNReducer = IN_TRASH_FN.reducer;

export const {setAllFilesReducer} = ALLfilesFN.actions;
export const ALLfilesFNReducer = ALLfilesFN.reducer;

export const {setIsLoadingReducer} = ISloadingFN.actions;
export const ISloadingFNReducer = ISloadingFN.reducer;

export const {setSharedUserOnFileReducer} = sharedUserOnFile.actions;
export const sharedUserOnFileReducer = sharedUserOnFile.reducer;

export const {setAllSharedFiles} = sharedFiles.actions;
export const sharedFilesReducer = sharedFiles.reducer;

export const {setAllDeletedFiles} = deletedFiles.actions;
export const deletedFilesReducer = deletedFiles.reducer;