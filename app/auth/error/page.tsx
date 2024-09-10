// app/auth/new-password/page.tsx
import { Suspense } from "react";

const AuthError = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <Suspense>
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl font-bold">Error</h1>
                    <p className="text-xl">An error occurred while trying to authenticate you.</p>
                </div>
            </Suspense>
        </div>
    );
}

export default AuthError;