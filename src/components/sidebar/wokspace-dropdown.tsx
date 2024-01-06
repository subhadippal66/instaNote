'use client'
import { User, workspace } from '@/lib/supabase/supabase.types'
import React, { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { useRouter } from 'next/navigation';

// Redux
import { setCurrWorkspace } from '@/redux/workspaceSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setCURRUSER } from '@/redux/userSlice';
import { AuthUser } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import DashboardSetup from '../dashboard-setup/DashboardSetup';
import { validate } from 'uuid';
import { setAllFilesReducer, setIsLoadingReducer } from '@/redux/folderSlice';

interface WorkspaceDropdownProps {
    privateWorkspaces : workspace[] | [];
    sharedWorkspaces : workspace[] | [];
    collaboratingWorkspaces : workspace[] | [];
    workspaceID : string;
    user: AuthUser,
    subscription: any
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({privateWorkspaces,
  sharedWorkspaces,collaboratingWorkspaces,
  workspaceID, user, subscription}) => {
  
  // const {dispatch, state} = useAppState()

  const router = useRouter();

  

  const [selectedOption, setSelectedOption] = useState<workspace|null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = React.useState("")

  const [allWorkspaces, setAllWorkspaces] = useState<any>([])

  // Redux
  const dispatch = useDispatch<AppDispatch>()

  dispatch(setCURRUSER({
    id: user.id,
    email: user.email,
    subscription: subscription
  }))
  

  useEffect(()=>{
    [...privateWorkspaces, ...sharedWorkspaces, ...collaboratingWorkspaces].map(data=>{
      if(data.id == workspaceID) {
        setSelectedOption(data)
        setValue(data.iconId + ' ' + data.title)

        // Redux
        dispatch(setCurrWorkspace(data))
      }
    })
    
    setAllWorkspaces([...privateWorkspaces,...collaboratingWorkspaces,...sharedWorkspaces])

  },[privateWorkspaces,sharedWorkspaces,collaboratingWorkspaces,workspaceID])



  const changeWorkspace = (id:string)=>{
    // dispatch(setAllFilesReducer(null))
    router.replace(`/dashboard/${id}`)
  }

  const CreateNewWorkSpaces = ()=>{
    alert('00')
  }


  return (
    <>
      {/* <div>{selectedOption?.iconId}{selectedOption?.title}</div> */}
      <div className='py-2 text-sm text-blue-400'>ALL WORKSPACES</div>
      <Popover >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          // aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-100" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {allWorkspaces.map((workspace:any) => (
              <CommandItem
                key={workspace.id}
                value={workspace.iconId + ' ' + workspace.title}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  // setIsOpen(false)

                  // WIP
                  changeWorkspace(workspace.id)
                }}
              >
                {workspace.iconId + ' ' + workspace.title}
              </CommandItem>
            ))}
            <div className='flex items-center justify-center'>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className='m-2'>➕ New Workspaces</Button>
                </DialogTrigger>
                <DialogContent className="w-full bg-transparent border-none p-0 bg-none">
                  <DashboardSetup user={user} subscription={subscription} />
                </DialogContent>
              </Dialog>

            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
    </>
  )
}

export default WorkspaceDropdown 