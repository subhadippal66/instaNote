import Sidebar from '@/components/sidebar/sidebar';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import React from 'react'
import { validate } from 'uuid';
import { cookies } from 'next/headers';
import { getCollaboratingWorkspaces, getFolders, getPrivateWorkspaces, getSharedWorkspaces, getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import { User } from '@/lib/supabase/supabase.types';

interface LayoutProps {
    children: React.ReactNode;
    params: any
}

const Layout:React.FC<LayoutProps> = async({children, params}) => {

    // get user
    const supabase = createServerComponentClient({cookies})
    const {data:{user}}:any = await supabase.auth.getUser();


    // subscription status
    const {data:subscription,error:subscriptionError} = await getUserSubscriptionStatus(user.id);

    // folders
    console.log(params)
    const {data:workspaceFolderData,error:foldersError} = await getFolders(params.workspaceid, false);
    
    // error
    if(subscriptionError || foldersError) redirect('/dashboard')


    const[privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] = 
      await Promise.all([
        getPrivateWorkspaces(user.id), 
        getCollaboratingWorkspaces(user.id),
        getSharedWorkspaces(user.id)
      ]
    );





  return (
    <>
    <main className='flex flex-row overflow-hidden h-screen w-screen'>

      <Sidebar 
        user={user} 
        params={params}
        collaboratingWorkspaces={collaboratingWorkspaces}
        privateWorkspaces={privateWorkspaces}
        sharedWorkspaces={sharedWorkspaces}
        subscription={subscription}
      />
      
      <div className='
          w-full
          h-full
          overflow-x-hidden
          relative overflow-scroll
      '>{children}
      </div>

    </main>
    </>
  )
}

export default Layout