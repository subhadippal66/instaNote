'use client'
import { getCollaboratingWorkspaces, getFolders, getPrivateWorkspaces, getSharedWorkspaces, getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './wokspace-dropdown';
import Folders from './folders';
import HomeAndTrash from './homeAndTrash';
import UserProfile from './userProfile';
import SharedFiles from './sharedFiles';
import { User } from '@/lib/supabase/supabase.types';
import { useDispatch } from 'react-redux';
import { setIsDrawerOpenRedux } from '@/redux/userSlice';
import { useAppSelector } from '@/redux/store';

interface SidebarProps {
    params: {workspaceid: string};
    className?: string;
    user: any|null;
    privateWorkspaces: any|null;
    sharedWorkspaces: any|null;
    collaboratingWorkspaces: any|null;
    subscription: any|null;
}

const Sidebar: React.FC<SidebarProps> = ({params, className, user,
  privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces,
  subscription}) => {

    // Sidebar state
    const dispatch = useDispatch();
    // dispatch(setIsDrawerOpenRedux(true))
    const drawerState = useAppSelector((state)=>state.ISDRAWEROPENReducer)
    
    if(!user) return;


  return (
    <aside
      className={twMerge(
        ` border-r
          ${!drawerState?'hidden':'flex flex-col w-[280px] shrink-0 p-4 gap-4 justify-between'}
        `,
        className
      )}
    >
      <div>
          <WorkspaceDropdown 
            privateWorkspaces={privateWorkspaces}
            sharedWorkspaces={sharedWorkspaces}
            collaboratingWorkspaces={collaboratingWorkspaces}
            workspaceID={params.workspaceid}
            user = {user}
            subscription = {subscription}
          ></WorkspaceDropdown>

          {/* Done */}
          <HomeAndTrash workspaceid={params.workspaceid}></HomeAndTrash>

          {/* Create folder section */}
          <Folders workspaceID={params.workspaceid}></Folders>

          {/* List Of Folders */}
          {/* <FoldersList workspaceID={params.workspaceid}></FoldersList> */}

          {/* shared files */}
          <SharedFiles workspaceId={params.workspaceid}></SharedFiles>
          

      </div>
      <div>
        <div className='pt-2'>Made with ♥️ in India</div>
        <UserProfile></UserProfile>
      </div>

    </aside>
  )
}

export default Sidebar