'use client'
import { useAppSelector } from '@/redux/store';
import { setIsDrawerOpenRedux, setScreenWidthRedux } from '@/redux/userSlice';
import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux';


interface FilePageLayoutProps {
    children: React.ReactNode;
    params: any
}

const FilePageLayout:React.FC<FilePageLayoutProps> = ({children,params}) => {

  // drawer state
  const dispatch = useDispatch()
  try{
    const screenWidth:number = useRef(window.innerWidth).current
    dispatch(setScreenWidthRedux(screenWidth))
  }catch(e){}
  const sw = useAppSelector((state)=>state.SCREENWIDTHReducer)
  useEffect(()=>{
    if(sw<700){
      dispatch(setIsDrawerOpenRedux(false))
    }
  },[params?.fileid])

  return (
    <main className=''>
        {children}
    </main>
  )
}

export default FilePageLayout