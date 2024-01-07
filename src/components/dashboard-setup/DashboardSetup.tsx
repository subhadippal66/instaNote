"use client"
import { AuthUser } from '@supabase/supabase-js'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import EmojiPicker from '../global/emoji-picker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Subscription, workspace } from '@/lib/supabase/supabase.types';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from '../ui/use-toast';
import { createWorkspace, getTotalNoOfWorkspaceQuery } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';
import { v4 } from 'uuid';
import { Button } from '../ui/button';
import Loader from '../global/loader';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setCURRUSER } from '@/redux/userSlice';


interface DashboardSetupProps{
    user: AuthUser;
    subscription: Subscription | null;
}

const DashboardSetup:React.FC<DashboardSetupProps> = ({
    user, subscription
}) => {

    
    const dispatch = useDispatch<AppDispatch>()

    dispatch(setCURRUSER({
      id: user.id,
      email: user.email,
      subscription: subscription
    }))

    const [selectedEmoji, setSelectedEmoji] = useState('📝');

    const supabase = createClientComponentClient();

    // console.log(user)
    // console.log(subscription)

    const router = useRouter();

    const {register, handleSubmit, reset, formState:{isSubmitting:isLoading,errors}} = 
        useForm<z.infer<typeof CreateWorkspaceFormSchema>>(
        {
            mode:'onChange', defaultValues:{
                logo:'',
                workspaceName: '',
            }
        }
    )

    const [totalWS, setTotalWS] = useState<number|null>(null)

    // start from here
    const onSubmit: SubmitHandler<
        z.infer<typeof CreateWorkspaceFormSchema>
    > = async (value) => {


        // subscription check
        if(subscription==null){
            if(!totalWS){
                const n = await getTotalNoOfWorkspaceQuery(user.id)
                console.log('DB hits')
                if(n){
                    console.log(n[0]?.value)
                    setTotalWS(n[0]?.value)
                    if(n[0]?.value>=2){
                        toast({
                            title: 'Upgrade to pro ❗',
                            description: `Cannot create more than 2 workspaces on free plan.`,
                        });
                        return; 
                    }
                }
            }

            if(totalWS && totalWS>=2){
                console.log('state')
                toast({
                    title: 'Upgrade to pro ❗',
                    description: `Cannot create more than 2 workspaces on free plan.`,
                });
                return;
            }else{
                
            }
        }



        const file = value.logo?.[0];
        let filePath = null;
        const workspaceUUID = v4();
        console.log(file);

        console.log('inside submit')

        if (file) {
        try {
            // const { data, error } = await supabase.storage
            // .from('workspace-logos')
            // .upload(`workspaceLogo.${workspaceUUID}`, file, {
            //     cacheControl: '3600',
            //     upsert: true,
            // });
            // if (error) throw new Error('');
            // filePath = data.path;
        } catch (error) {
            // console.log('Error', error);
            // toast({
            // variant: 'destructive',
            // title: 'Error! Could not upload your workspace logo',
            // });
        }
        }
        try {



        const newWorkspace: workspace = {
            data: null,
            createdAt: new Date().toISOString(),
            iconId: selectedEmoji,
            id: workspaceUUID,
            inTrash: '',
            title: value.workspaceName,
            workspaceOwner: user.id,
            logo: filePath || null,
            bannerUrl: '',
        };
        const { data, error: createError } = await createWorkspace(newWorkspace);
        if (createError) {
            throw new Error();
        }
        // dispatch({
        //     type: 'ADD_WORKSPACE',
        //     payload: { ...newWorkspace, folders: [] },
        // });

        toast({
            title: 'Workspace Created',
            description: `${newWorkspace.title} has been created successfully.`,
        });

        router.replace(`/dashboard/${newWorkspace.id}`);
        } catch (error) {
        console.log(error, 'Error');
        toast({
            variant: 'destructive',
            title: 'Could not create your workspace',
            description:
            "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
        });
        } finally {
            reset();
        }
    };

// console.log(subscription)


  return (
    <Card className='w-[] h-screen max-w-[800px] sm:h-auto'>
        <CardHeader>
            <CardTitle>Create A Workspace</CardTitle>
            <CardDescription>
                Lets create a workspace to get you started.You can add
                collaborators later to a page in the workspace.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='text-5xl'>
                            <EmojiPicker getValue={(emoji)=>{setSelectedEmoji(emoji)}}>
                                {selectedEmoji}
                            </EmojiPicker>
                        </div>
                        <div className='w-full'>
                            <Label htmlFor='workspaceName' className='text-sm text-muted-foreground'>
                                Name
                            </Label>
                            <Input 
                                id='workspaceName'
                                type='text'
                                placeholder='Workspace Name'
                                disabled={isLoading}
                                {...register('workspaceName',{
                                    required: 'workspace name is required'
                                })}
                            />
                            <small className='text-red-600'>
                                {errors?.workspaceName?.message?.toString()}
                            </small>
                        </div>
                    </div>

                    {/* workspace banner */}
                    {/* <div>
                        <Label htmlFor='logo' className='text-sm text-muted-foreground'>
                            Workspace Logo
                        </Label>
                        <Input 
                            id='logo'
                            type='file'
                            accept='image/*'
                            placeholder='Workspace Logo'
                            disabled={isLoading || subscription?.status !== 'active'}
                            {...register('logo',{
                                // required: 'workspace logo is required'
                            })}
                        />
                        <small className='text-red-600'>
                            {errors?.logo?.message?.toString()}
                        </small>
                        {subscription?.status !== 'active' && (
                            <small
                            className="
                            text-muted-foreground
                            block
                            pt-3
                            "
                            >
                            To customize your workspace, you need to be on a Pro Plan
                            </small>
                        )}
                    </div> */}

                    <div className="self-end">
                        <Button
                            disabled={isLoading}
                            type="submit"
                            size={'sm'}
                            className='text-sm'
                        >
                            {!isLoading ? 'Create Workspace' : <Loader />}
                        </Button>
                    </div>
                </div>
            </form>
        </CardContent>
    </Card>
  )
}

export default DashboardSetup