import {configureStore} from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import CURRworkspaceFNReducer from './workspaceSlice' 
import  { ALLfoldersFNReducer,IN_TRASH_FNReducer,ALLfilesFNReducer
    ,ISloadingFNReducer,sharedUserOnFileReducer, sharedFilesReducer, deletedFilesReducer
 } from './folderSlice'
import {USERSLICEFNReducer,ISDRAWEROPENReducer,SCREENWIDTHReducer} from './userSlice'

export const store = configureStore({
    reducer: {
        CURRworkspaceFNReducer, 
        ALLfoldersFNReducer, 
        USERSLICEFNReducer,
        IN_TRASH_FNReducer,
        ALLfilesFNReducer,
        ISloadingFNReducer,
        ISDRAWEROPENReducer,
        SCREENWIDTHReducer,
        sharedUserOnFileReducer,
        sharedFilesReducer,
        deletedFilesReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector