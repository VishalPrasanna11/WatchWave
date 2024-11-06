import { useState } from "react";
import { LayoutGrid, LogOut, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useCreateUser,useGetUser } from "../../API/UserAPI";
import { toast } from "sonner";
import { log } from "console";
import logger from "@/config/logger";

export function UserNav() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  const { mutate: createUser } = useCreateUser();

  // Check if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('basicAuth');
  const basicAuth = btoa(`${email}:${password}`);
  //const { user, isLoading: userLoading, isError, error } = useGetUser(basicAuth);

  const { user: user, isLoading: userLoading, isError, error } = useGetUser(email && password ? btoa(`${email}:${password}`) : '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isError || !user) {
      if (!user) {
        toast.error('User not found');
      
      setIsLoading(false);
      return;
      }

      logger.error('Login failed:, ${error}');
      toast.error('Login failed: ' + (error?.message || 'Unknown error'));
      setIsLoading(false);
      return;
    }

    localStorage.setItem('basicAuth', btoa(`${email}:${password}`));
    window.location.reload();
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('basicAuth');
    window.location.reload();
  };

  const handleSignUpClick = () => {
    setShowSignUp(!showSignUp);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the createUser function with the user data
    createUser({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });
  };

  if (!isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-4" align="end">
          {!showSignUp ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-8"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-8"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-8" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              <Separator />
              <Button 
                variant="outline" 
                className="w-full h-8"
                onClick={handleSignUpClick}
              >
                Sign Up
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-8"
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-8"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-8"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-8"
                />
              </div>
              <Button type="submit" className="w-full h-8">
                Create Account
              </Button>
              <Separator />
              <Button 
                variant="outline" 
                className="w-full h-8"
                onClick={handleSignUpClick}
              >
                Back to Sign In
              </Button>
            </form>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="#" alt="Avatar" />
                  <AvatarFallback className="bg-transparent">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">John Doe</p>
            <p className="text-xs leading-none text-muted-foreground">
              johndoe@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <a href="/dashboard" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <a href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Account
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="hover:cursor-pointer" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
