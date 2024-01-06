'use client'

import Loader from '@/components/global/loader';
import { setInTrashStateReducer } from '@/redux/folderSlice';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { setIsDrawerOpenRedux, setScreenWidthRedux } from '@/redux/userSlice';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { validate } from 'uuid';


interface WorkspacePageProms {
  params:any;
}

const WorkspacePage:React.FC<WorkspacePageProms> = ({params}) => {

 


    // workspace id check

    const dispatch = useDispatch<AppDispatch>()
    dispatch(setInTrashStateReducer(false))

    const router = useRouter()

    const isvalidWorkspaceId = validate(params.workspaceid)
    if(!isvalidWorkspaceId){
      router.replace('/dashboard')
    }

    // screen width redux
    try{
      const windowSize = useRef(window.innerWidth).current;
      dispatch(setScreenWidthRedux(windowSize))
    }catch(e){}
    // conditional statement using use effect WIP
    
    
    const drawerState = useAppSelector((state)=>state.ISDRAWEROPENReducer)

    useEffect(()=>{
      dispatch(setIsDrawerOpenRedux(true))
    },[])
      // if(windowSize<700){
      //   dispatch(setIsDrawerOpenRedux(false))
      // }

  return (
    <>
    <div className='text-center py-4'>Click on a Folder or File to edit ✏️</div>
    </>
  )
}

export default WorkspacePage