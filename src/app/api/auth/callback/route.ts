import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req:NextRequest){
    const requestUrl = new URL(req.url)
    const code = requestUrl.searchParams.get('code')

    if(code){
        console.log('kkk')
        try{
            const supabase = createRouteHandlerClient({cookies})
            await supabase.auth.exchangeCodeForSession(code)
        }catch(e){
            console.log(e)
        }
    }

    // reset password
    const type = requestUrl.searchParams.get('type');
    if(type == 'recovery'){
        return NextResponse.redirect(`${requestUrl.origin}/newPassword`)
    }

    // const type = requestUrl.searchParams.get('')

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}