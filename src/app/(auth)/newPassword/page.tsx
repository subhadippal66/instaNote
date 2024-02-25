"use client"
import React, { useState } from 'react'
import Link from 'next/link';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FormSchemaNewPassword } from '@/lib/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { actionNewPassword } from '@/lib/server-action/auth-actions';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Logo from '../../../../public/cypresslogo.svg'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Loader from '@/components/global/loader';


const NewPassword = () => {
    const router = useRouter();

  const [submitError, setSubmitError] = useState('');

    const form = useForm<z.infer<typeof FormSchemaNewPassword>>({
        mode:"onChange",
        resolver: zodResolver(FormSchemaNewPassword),
        defaultValues:{confirmPassword:'', password:''}
    })
    

    const onSubmit_: SubmitHandler<z.infer<typeof FormSchemaNewPassword>> = async(
        formData
      )=>{
        const {error, data} = await actionNewPassword(formData);
    
        if(error){
          form.reset();
          setSubmitError(error);
        }else if(data){
            alert('Passworrd changed!')
            router.replace('./dashboard')
        }
    }
    const isLoading = form.formState.isSubmitting;

  return (
    <div>

        <Form {...form}>
        <form 
        onChange={()=>{
            if(submitError) setSubmitError('')
        }}
        onSubmit={form.handleSubmit(onSubmit_)} className='w-full justify-center sm:w-[400px] space-y-6 flex flex-col'
        >
            <Link href='/' className='w-full flex justify-start items-center'>
            <Image src={Logo} alt='InstaNote logo' width={50} height={50}/>
            <span className='font-semibold dark:text-white text-4xl ml-2'>InstaNote</span>
            </Link>
            <FormDescription className='
            text-foreground/60'>
            An all in one collaboration and productivity platform
            </FormDescription>

            <h4>Choose new password</h4>
            <FormField 
            disabled={isLoading} 
            control={form.control}
            name='password' 
            render={({field})=>(
                <FormItem>
                <FormControl>
                    <Input type='password' placeholder='password' {...field}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            
            <FormField 
            disabled={isLoading} 
            control={form.control}
            name='confirmPassword' 
            render={({field})=>(
                <FormItem>
                <FormControl>
                    <Input type='password' placeholder='Confirm Password' {...field}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />



            <Button type='submit' className='w-full p-6' size='lg' disabled={isLoading}>
            {!isLoading ? "Change password" : <Loader/>}
            </Button>

            <span className='self-center'>
            Already registered ? 
            <Link href='/login' className='text-primary'> login</Link>
            </span>

            <span className='self-center'>
            Dont have an account 
            <Link href='/signup' className='text-primary'> Sign Up</Link>
            </span>

        </form>
        </Form>

    </div>
  )
}

export default NewPassword