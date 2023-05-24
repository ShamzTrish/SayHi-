"use client"

import { signOut } from 'next-auth/react'
import { ButtonHTMLAttributes, FC, useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from './ui/Button'
import { Loader2, LogOut } from 'lucide-react'

// here we are saying that this class 'SignOutButtonProps' should have everything what this class 'ButtonHTMLAttributes<HTMLButtonElement>' also has which is all the default stuff what we pass on the the HTML button.

// interface =  keyword is used to define the shape of an object or a class. It helps us describe the properties and methods that an object or class should have.
//ButtonHTMLAttributes is an interface provided by TypeScript that defines the attributes that can be used with an HTML button element. It includes properties like disabled, type, onClick, and so on.
//HTMLButtonElement is a type that represents an HTML button element in the browser's DOM (Document Object Model).
//extends is a keyword in TypeScript that allows one interface to inherit the properties and methods of another interface. It means that SignOutButtonProps is taking all the properties and methods from ButtonHTMLAttributes<HTMLButtonElement>.

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({...props}) => {
  
    const [isSignignOut, setIsSigningOut ] = useState<boolean>(false)

    const signOutHandler = async () => {
        
        setIsSigningOut(true)
        try {
            await signOut()
        } catch(error) {
            toast.error('There was a problem signing out!')
        } finally {
            setIsSigningOut(false)
        }
         
    }
  
    return <Button  {...props} buttonVariant="ghost" onClick={signOutHandler}>
        {isSignignOut ? (
            <Loader2 className='animate-spin h-4 w-4' />
        ) : (
            <LogOut className='w-4 h-4'/>
        )}
    </Button>
}

export default SignOutButton