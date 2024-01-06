// 'use client'
import { useAppSelector } from '@/redux/store';
import { setIsDrawerOpenRedux, setScreenWidthRedux } from '@/redux/userSlice';
import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux';

interface FolderLayoutProps {
    children : React.ReactNode;
    params: any;
}

const FolderLayout:React.FC<FolderLayoutProps> = ({children,params}) => {

  // sidebar open state
  // const dispatch = useDispatch()
  // try{
  //   const screenWidth:number = useRef(window.innerWidth).current
  //   dispatch(setScreenWidthRedux(screenWidth))
  // }catch(e){}
  // const sw = useAppSelector((state)=>state.SCREENWIDTHReducer)
  // useEffect(()=>{
  //   if(sw<700){
  //     dispatch(setIsDrawerOpenRedux(false))
  //   }
  // },[params?.folderid])


  return (
    <div>{children}</div>
  )
}

export default FolderLayout