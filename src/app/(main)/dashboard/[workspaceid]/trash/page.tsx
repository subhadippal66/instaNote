'use client'

import { setInTrashStateReducer } from '@/redux/folderSlice'
import { AppDispatch } from '@/redux/store'
import React from 'react'
import { useDispatch } from 'react-redux'

const Trash = () => {
    const dispatch = useDispatch<AppDispatch>()

    dispatch(setInTrashStateReducer(true))

  return (
    <div className='pt-10 px-4 text-xs gap-4 flex flex-col justify-center items-center'>
        <div>
            All Files/Folders in Trash will be deleted after 30 days.
        </div>
        <div className='text-green-300'>
            Click on the File/Folder to Restore.
        </div>
    </div>
  )
}

export default Trash