// app/layout.tsx
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs';
import '../globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (

                <ClerkProvider>
                    <div className='flex h-full items-center justify-center'>
                        {children}
                    </div>
                </ClerkProvider>

    );
}
