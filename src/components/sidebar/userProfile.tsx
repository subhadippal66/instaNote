'use client'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useAppSelector } from '@/redux/store'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const UserProfile = () => {

   const {email} = useAppSelector((state)=>state.USERSLICEFNReducer)
   const router = useRouter()

   const supabase = createClientComponentClient();

   const signOut = async()=> {
    const { error } = await supabase.auth.signOut()
    return router.replace('/login')

  }

  return (
    <div className='mt-2 p-2 border-2 rounded-full flex flex-row justify-between items-center'>
        <div>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>ME</AvatarFallback>
            </Avatar>
        </div>
            <div className='pr-1 text-right'>
                <div className='text-xs'>{email}</div>
                <div
                onClick={()=>{confirm('logged out ?') && signOut()}} 
                className='
                text-red-300 cursor-pointer hover:text-red-400 transition-all duration-300'>
                    logout
                </div>
            </div>
    </div>
  )
}

export default UserProfile