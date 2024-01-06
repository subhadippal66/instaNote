'use client'
import Loader from '@/components/global/loader';
import { useAppSelector } from '@/redux/store';
import React from 'react'

interface LayoutProps {
    children: React.ReactNode;
    params: any
}

const Layout:React.FC<LayoutProps> = ({children, params}) => {

  const isLoadingState = useAppSelector((state)=>state.ISloadingFNReducer)

  return (
    <>
    {isLoadingState ?
      <div className='absolute z-50 
        h-screen w-screen flex justify-center 
        items-center bg-slate-300 bg-opacity-20'>
        <Loader />
        <div>Loading ...</div>
      </div> : <></> 
    }

    <main className='flex overflow-hidden h-screen'>
        {children}
    </main>
    </>
  )
}

export default Layout