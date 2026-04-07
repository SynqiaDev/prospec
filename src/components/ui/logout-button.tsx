"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "../../lib/auth-client";
import { Button } from "./button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

export function LogoutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                },
            },
        });
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="hover:text-red-500"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Sair</TooltipContent>
        </Tooltip>
    );
}

export default LogoutButton;
